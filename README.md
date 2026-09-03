#  AgentBench


<p align="center">
  <strong>LLM Evaluation, Done Right.</strong>
</p>

<p align="center">
  Benchmark • Evaluate • Compare • Analyze
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
