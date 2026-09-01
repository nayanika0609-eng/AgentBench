#  AgentBench


<p align="center">
  <strong>LLM Evaluation, Done Right.</strong>
</p>

<p align="center">
  Benchmark • Evaluate • Compare • Analyze
</p>

<p align="center">
  <a href="#-why-agentbench">Why AgentBench</a> •
  <a href="#-features">Features</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-installation">Installation</a> •
  <a href="#-usage">Usage</a> •
  <a href="#-rag-evaluation">RAG</a> •
  <a href="#-custom-models">Custom Models</a>
</p>

---

## What is AgentBench?

**AgentBench is a full-stack LLM evaluation platform that allows users to benchmark, evaluate, compare, and rank Large Language Models using a unified evaluation workflow.**

Instead of testing models individually and manually comparing their responses, AgentBench runs the same benchmark across multiple models and evaluates their responses using measurable metrics.

AgentBench combines:

- 📊 Model performance evaluation
- ⚡ Response latency measurement
- 🔍 Retrieval-Augmented Generation (RAG)
- 🧠 Response quality evaluation
- 📈 Model comparison
- 🏆 Model rankings
- 📄 Document-grounded evaluation

---

#  Why AgentBench?

Choosing an LLM should not depend only on which model produces the most impressive response once.

Different models can perform differently depending on:

- The task
- The prompt
- The available context
- Response quality
- Instruction adherence
- Retrieval quality
- Response latency

**AgentBench provides a consistent environment for testing multiple models against the same benchmark and comparing their performance using measurable metrics.**

### The basic idea


                         USER PROMPT
                              │
                              ▼
                     ┌────────────────┐
                     │   AgentBench   │
                     └───────┬────────┘
                             │
                 ┌───────────┼───────────┐
                 ▼           ▼           ▼
              Mistral      Llama       Gemma
                 │           │           │
                 └───────────┼───────────┘
                             ▼
                      ┌──────────────┐
                      │  Evaluation  │
                      └──────┬───────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
          Quality          Latency          RAG
              │              │              │
              └──────────────┼──────────────┘
                             ▼
                    Model Comparison
                             │
                             ▼
                       Leaderboard

# 🚀 How to Run AgentBench

AgentBench is a full-stack application consisting of:

- **Frontend:** React + TypeScript + Vite
- **Backend:** FastAPI + Python
- **LLM Runtime:** Ollama
- **Vector Search:** FAISS

The frontend and backend need to be running at the same time.

---

## 📋 Prerequisites

Before running AgentBench, make sure you have the following installed:

| Requirement | Version |
|---|---|
| Python | 3.10+ |
| Node.js | 18+ |
| npm | 9+ |
| Git | Latest |
| Ollama | Latest |

You can verify your installations with:

```bash
python --version
node --version
npm --version
git --version
ollama --version

# Features

## Multi-Model Benchmarking

Run the same prompt against multiple LLMs and evaluate their responses independently.

AgentBench is currently configured with:

- `mistral:7b`
- `llama3.1:8b`
- `gemma2:9b`

The model configuration is structured so that users can add and test their own compatible Ollama models as well.

```

##  Response Evaluation

AgentBench evaluates responses across multiple dimensions.

| Metric | Purpose |
|---|---|
| **Readability** | Measures how clear and readable the response is |
| **Keyword** | Checks whether required keywords or concepts are present |
| **Adherence** | Measures how closely the response follows the requested task |
| **Latency** | Measures how long the model takes to respond |
| **RAG Context** | Evaluates responses using retrieved project documents |

These metrics provide a more complete picture of model performance than a single score.

---

##  Latency Analysis

AgentBench records model response latency and allows models to be compared based on response speed.

This helps answer questions such as:

> Which model provides the best response while maintaining acceptable response time?

---

##  Retrieval-Augmented Generation

AgentBench supports Retrieval-Augmented Generation (RAG).

Users can upload project-specific documents and index them before running benchmarks.

The RAG pipeline follows:
```text 
Document
   │
   ▼
Document Loader
   │
   ▼
Text Extraction
   │
   ▼
Text Chunking
   │
   ▼
Embeddings
   │
   ▼
FAISS Vector Index
   │
   ▼
Top-K Retrieval
   │
   ▼
LLM Context
   │
   ▼
Generated Response
```
## Application Screenshots
The application is also available in Light Mode, with a convenient theme toggle.
<img width="1917" height="1037" alt="image" src="https://github.com/user-attachments/assets/497965a7-7856-4955-be2e-ae46820befd4" />
<img width="1867" height="906" alt="image" src="https://github.com/user-attachments/assets/e4d08e03-e3dc-46c8-9605-904ff4e48754" />
<img width="1916" height="1022" alt="image" src="https://github.com/user-attachments/assets/0501b897-f704-40e2-8d75-bb15420ef0f9" />
<img width="1527" height="987" alt="image" src="https://github.com/user-attachments/assets/1df18a47-c12c-41f0-a1bb-0e263bd96870" />
<img width="1908" height="1195" alt="image" src="https://github.com/user-attachments/assets/71d7ebef-4be9-40e1-96bb-16ab0048a9d5" />

