"""stream-gate: toggle all outgoing IPTV stream connections via iptables."""
import subprocess
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="stream-gate", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# Track state in memory (container lifecycle)
_blocked = False

IPTABLES_CHAIN = "STREAM_GATE"


def _run(cmd: list[str]) -> str:
    result = subprocess.run(cmd, capture_output=True, text=True)
    return result.stdout + result.stderr


def _ensure_chain() -> None:
    """Create the custom chain if it does not yet exist."""
    _run(["iptables", "-N", IPTABLES_CHAIN])
    # Hook it into OUTPUT (idempotent)
    check = subprocess.run(
        ["iptables", "-C", "OUTPUT", "-j", IPTABLES_CHAIN],
        capture_output=True,
    )
    if check.returncode != 0:
        _run(["iptables", "-A", "OUTPUT", "-j", IPTABLES_CHAIN])


@app.on_event("startup")
async def startup() -> None:
    _ensure_chain()


@app.get("/status")
def status() -> dict:
    """Return current block state."""
    return {"blocked": _blocked}


@app.post("/block")
def block_streams() -> dict:
    """Drop all outgoing TCP connections on common IPTV ports."""
    global _blocked
    if _blocked:
        return {"blocked": True, "message": "Already blocked"}
    _ensure_chain()
    for port in (80, 443, 1935, 8080, 8888, 34400):
        _run([
            "iptables", "-A", IPTABLES_CHAIN,
            "-p", "tcp", "--dport", str(port),
            "-j", "DROP",
        ])
    _blocked = True
    return {"blocked": True, "message": "Streams blocked"}


@app.post("/unblock")
def unblock_streams() -> dict:
    """Flush the custom chain to restore outgoing traffic."""
    global _blocked
    _ensure_chain()
    _run(["iptables", "-F", IPTABLES_CHAIN])
    _blocked = False
    return {"blocked": False, "message": "Streams unblocked"}
