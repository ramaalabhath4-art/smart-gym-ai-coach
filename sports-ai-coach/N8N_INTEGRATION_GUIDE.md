# n8n Integration Guide - AI Sports Coach

## Overview
This guide explains how to integrate the AI Sports Coach Community Chat with n8n to connect with external messaging platforms like WhatsApp, Telegram, Discord, etc.

---

## Architecture

```
Community Chat (Web App)
        ↓
   tRPC API
        ↓
   Database (Messages)
        ↓
   n8n Webhook
        ↓
   External Platforms (WhatsApp, Telegram, Discord, etc.)
```

---

## Step 1: Create n8n Webhook

### 1.1 Create a new workflow in n8n
1. Go to https://n8n.io (or your self-hosted instance)
2. Click **"New Workflow"**
3. Add a **"Webhook"** node as the trigger
4. Set the method to **POST**
5. Copy the webhook URL

### 1.2 Configure the webhook
```json
{
  "method": "POST",
  "url": "https://your-n8n-instance.com/webhook/sports-coach-chat",
  "body": {
    "userId": 123,
    "userName": "John Doe",
    "content": "Hello everyone!",
    "platform": "web",
    "timestamp": "2026-03-18T12:00:00Z"
  }
}
```

---

## Step 2: Add Message Handler in Backend

### 2.1 Create an n8n webhook trigger in your API
Add this to `server/routers.ts`:

```typescript
n8n: router({
  notifyChat: publicProcedure
    .input(z.object({
      userId: z.number(),
      userName: z.string(),
      content: z.string(),
      platform: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      // Send to n8n webhook
      const webhookUrl = process.env.N8N_WEBHOOK_URL;
      if (!webhookUrl) return { success: false };

      try {
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        return { success: true };
      } catch (error) {
        console.error("n8n webhook failed:", error);
        return { success: false };
      }
    }),
}),
```

### 2.2 Update Community Chat to trigger n8n
In `CommunityChat.tsx`, after sending a message:

```typescript
// Send to n8n
await trpc.n8n.notifyChat.mutate({
  userId: user.id,
  userName: user.name || "Anonymous",
  content: newMessage,
  platform: "web",
});
```

---

## Step 3: Connect to External Platforms

### 3.1 WhatsApp Integration
1. In n8n, add a **"WhatsApp"** node after the webhook
2. Configure your WhatsApp Business Account credentials
3. Set up message routing:
   ```
   Webhook → WhatsApp → Send Message
   ```

### 3.2 Telegram Integration
1. Add a **"Telegram"** node
2. Get your bot token from @BotFather
3. Configure channel/group ID
4. Set up message routing:
   ```
   Webhook → Telegram → Send Message
   ```

### 3.3 Discord Integration
1. Add a **"Discord"** node
2. Create a Discord bot and get the token
3. Set the channel ID
4. Configure:
   ```
   Webhook → Discord → Send Message
   ```

---

## Step 4: Set Environment Variables

Add to your `.env` file:

```bash
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/sports-coach-chat
N8N_API_KEY=your-n8n-api-key
WHATSAPP_API_KEY=your-whatsapp-key
TELEGRAM_BOT_TOKEN=your-telegram-token
DISCORD_BOT_TOKEN=your-discord-token
```

---

## Step 5: Create Bidirectional Sync

### 5.1 Receive messages from external platforms
Create a reverse webhook in n8n:

```json
{
  "method": "POST",
  "endpoint": "/api/trpc/chat.receiveExternalMessage",
  "body": {
    "platform": "whatsapp",
    "externalUserId": "1234567890",
    "userName": "John (WhatsApp)",
    "content": "Hello from WhatsApp!",
    "externalMessageId": "msg_123"
  }
}
```

### 5.2 Add receiver in backend
```typescript
chat: router({
  // ... existing code ...
  
  receiveExternalMessage: publicProcedure
    .input(z.object({
      platform: z.string(),
      externalUserId: z.string(),
      userName: z.string(),
      content: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false };

      // Save message with platform info
      await db.insert(messages).values({
        userId: 0, // Use 0 for external users
        content: `[${input.platform}] ${input.userName}: ${input.content}`,
      });

      return { success: true };
    }),
}),
```

---

## Step 6: Test the Integration

### 6.1 Test webhook
```bash
curl -X POST https://your-n8n-instance.com/webhook/sports-coach-chat \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "userName": "Test User",
    "content": "Hello from test!",
    "platform": "web"
  }'
```

### 6.2 Verify messages appear in:
- ✅ Community Chat (web app)
- ✅ WhatsApp group
- ✅ Telegram channel
- ✅ Discord server

---

## Advanced Features

### Message Formatting
```typescript
// Format messages for different platforms
const formatMessage = (content: string, platform: string) => {
  if (platform === "whatsapp") {
    return `🏋️ *${content}*`;
  } else if (platform === "telegram") {
    return `💪 **${content}**`;
  }
  return content;
};
```

### Message Moderation
Add an n8n node to filter/moderate messages before posting:
```
Webhook → Filter (Moderation) → Platform
```

### Analytics
Track message counts per platform:
```typescript
analytics: router({
  getMessageStats: publicProcedure.query(async () => {
    const db = await getDb();
    // Query messages by platform
  }),
}),
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Webhook not triggering | Check webhook URL is correct and n8n is running |
| Messages not appearing | Verify API credentials for each platform |
| Duplicate messages | Add deduplication logic in n8n |
| Rate limiting | Implement message queue in n8n |

---

## Resources

- [n8n Documentation](https://docs.n8n.io)
- [WhatsApp Integration](https://docs.n8n.io/nodes/n8n-nodes-base.whatsapp)
- [Telegram Integration](https://docs.n8n.io/nodes/n8n-nodes-base.telegram)
- [Discord Integration](https://docs.n8n.io/nodes/n8n-nodes-base.discord)

---

## Next Steps

1. ✅ Set up n8n instance
2. ✅ Create webhook in n8n
3. ✅ Configure external platforms
4. ✅ Test bidirectional sync
5. ✅ Deploy to production
