"""
rag_system.py
Smart Gym AI Coach - Complete RAG System
LangChain + FAISS + HuggingFace
"""

import os
import json
import pickle
from typing import Optional
from pathlib import Path

# LangChain imports
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_core.documents import Document

# ================== CONFIG ==================
BASE_DIR     = Path(__file__).parent
DATA_FILE    = BASE_DIR / "exercises_data.json"
FAISS_INDEX  = BASE_DIR / "faiss_index"
EMBED_MODEL  = "sentence-transformers/all-MiniLM-L6-v2"

# ================== LOAD DATA ==================

def load_exercises() -> list:
    """Load exercises from JSON file"""
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data["exercises"]

# ================== BUILD DOCUMENTS ==================

def build_documents(exercises: list) -> list[Document]:
    """Convert exercises to LangChain Documents"""
    documents = []
    for ex in exercises:
        # Build rich text content for each exercise
        content = f"""
Exercise: {ex['name']}
Category: {ex['category']}
Difficulty: {ex['difficulty']}
Primary Muscles: {', '.join(ex['muscles_primary'])}
Secondary Muscles: {', '.join(ex['muscles_secondary'])}
Equipment: {', '.join(ex['equipment'])}
Calories per 10 min: {ex['calories_per_10min']}

Description:
{ex['description']}

How To Perform:
{chr(10).join([f"{i+1}. {step}" for i, step in enumerate(ex['how_to'])])}

Common Mistakes:
{chr(10).join([f"- {mistake}" for mistake in ex['common_mistakes']])}

Tips for Beginners: {ex['tips']['beginner']}
Tips for Intermediate: {ex['tips']['intermediate']}
Tips for Advanced: {ex['tips']['advanced']}

Safety: {ex['safety']}

Complementary Exercises: {', '.join(ex['complementary_exercises'])}
        """.strip()

        doc = Document(
            page_content=content,
            metadata={
                "name":         ex["name"],
                "category":     ex["category"],
                "difficulty":   ex["difficulty"],
                "muscles":      ex["muscles_primary"],
                "equipment":    ex["equipment"],
                "youtube_url":  ex.get("youtube_url", ""),
                "calories":     ex["calories_per_10min"],
            }
        )
        documents.append(doc)
    return documents

# ================== BUILD FAISS INDEX ==================

def build_faiss_index(force_rebuild: bool = False):
    """Build or load FAISS vector index"""
    embeddings = HuggingFaceEmbeddings(
        model_name=EMBED_MODEL,
        model_kwargs={"device": "cpu"},
        encode_kwargs={"normalize_embeddings": True},
    )

    # Load existing index if available
    if FAISS_INDEX.exists() and not force_rebuild:
        print("✅ Loading existing FAISS index...")
        vectorstore = FAISS.load_local(
            str(FAISS_INDEX),
            embeddings,
            allow_dangerous_deserialization=True,
        )
        print(f"✅ FAISS index loaded successfully")
        return vectorstore

    # Build new index
    print("🔄 Building new FAISS index...")
    exercises = load_exercises()
    documents = build_documents(exercises)

    # Split documents into chunks
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
        separators=["\n\n", "\n", ". ", " "],
    )
    chunks = splitter.split_documents(documents)
    print(f"📄 Created {len(chunks)} chunks from {len(documents)} exercises")

    # Build FAISS index
    vectorstore = FAISS.from_documents(chunks, embeddings)
    vectorstore.save_local(str(FAISS_INDEX))
    print(f"✅ FAISS index saved to {FAISS_INDEX}")
    return vectorstore

# ================== SEARCH ==================

def search_exercises(
    vectorstore,
    query:         str,
    exercise_name: Optional[str] = None,
    k:             int = 3,
) -> str:
    """Search for relevant exercise information"""
    # Build search query
    if exercise_name:
        search_query = f"{exercise_name} {query}"
    else:
        search_query = query

    # Search with MMR for diversity
    results = vectorstore.max_marginal_relevance_search(
        search_query,
        k=k,
        fetch_k=k * 2,
    )

    if not results:
        return "No relevant exercise information found."

    # Combine results
    context_parts = []
    for doc in results:
        exercise = doc.metadata.get("name", "Unknown")
        context_parts.append(f"[{exercise.upper()}]\n{doc.page_content}")

    return "\n\n---\n\n".join(context_parts)

# ================== SINGLETON ==================

_vectorstore = None

def get_vectorstore():
    """Get or create vectorstore singleton"""
    global _vectorstore
    if _vectorstore is None:
        _vectorstore = build_faiss_index()
    return _vectorstore
