from cat.mad_hatter.decorators import tool, hook
from cat.log import log
from qdrant_client.http.models import (
    SearchParams,
    QuantizationSearchParams,
)
from langchain.docstore.document import Document
import requests

PROMPT_PREFIX = """Tu sei CyberChat AI, un assistente virtuale AI in italiano che supporta l'analista CyberSecurity nelle prime fasi di identificazione delle minacce, accelerando il processo di risposta alla sicurezza.
Rispondi all'utente concentrandoti sul seguente contesto.
"""

@hook
def agent_prompt_prefix(prefix, cat):
    prefix = PROMPT_PREFIX
    return prefix

@hook(priority=1)
def before_cat_recalls_declarative_memories(declarative_recall_config: dict, cat) -> dict:
  declarative_recall_config["k"] = 5
  return declarative_recall_config

@tool
def vulnerability_by_id(id, cat):
    """Richiama questo tool solo quando l'utente chiede le informazioni di una specifica vulnerabilità. Prende in input l'identificativo della vulnerabilità."""
    
    url = f"https://services.nvd.nist.gov/rest/json/cves/2.0?cveId={id}"
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        
        # Estrai la descrizione in inglese
        descriptions = data["vulnerabilities"][0]["cve"]["descriptions"]
        description = next((desc["value"] for desc in descriptions if desc["lang"] == "en"), "Descrizione non trovata.")
        
        print(description)
        return description
    else:
        print("Errore nella richiesta:", response.status_code)