"""
build_references.py
شغلي هذا الكود مرة واحدة فقط لاستخراج reference sequences
"""
import numpy as np
import joblib
import os

import pathlib
os.chdir(pathlib.Path(__file__).parent)

# ================== LOAD ==================
encoder = joblib.load("encoder.pkl")
actions = list(encoder.classes_)

X = np.load("X_sequences.npy")  # (N, 15, 140)
y = np.load("y_labels.npy")     # (N,)

print(f"X shape: {X.shape}")
print(f"y shape: {y.shape}")
print(f"Classes: {len(actions)}")

# ================== EXTRACT REFERENCES ==================
references = {}

for action in actions:
    mask    = y == action
    X_action = X[mask]

    if len(X_action) == 0:
        print(f"⚠️ No sequences for: {action}")
        continue

    # احسب visibility score لكل sequence
    scores = []
    for seq in X_action:
        vis   = seq[:, :132].reshape(15, 33, 4)[:, :, 3]
        score = float(np.mean(vis))
        scores.append(score)

    scores = np.array(scores)

    # خذ أفضل 5 sequences وخذ متوسطهم
    top_n       = min(5, len(X_action))
    top_indices = np.argsort(scores)[-top_n:]
    best_seqs   = X_action[top_indices]
    reference   = np.mean(best_seqs, axis=0)  # (15, 140)

    references[action] = reference
    print(f"✅ {action:30s} → {len(X_action):4d} sequences | best score: {scores[top_indices[-1]]:.3f}")

# ================== SAVE ==================
np.save("references.npy", references)
print(f"\n✅ references.npy saved!")
print(f"Total exercises: {len(references)}")

# ================== VERIFY ==================
loaded = np.load("references.npy", allow_pickle=True).item()
print(f"\n✅ Verified - loaded {len(loaded)} references")
for action, ref in loaded.items():
    print(f"  {action:30s} → shape: {ref.shape}")
