import { randomBytes } from "node:crypto";

export function renderTrackingPage(id: string) {
  const nonce = randomBytes(18).toString("base64");
  const html = `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Acompanhamento da ordem</title><body><main><h1>Acompanhamento da ordem de serviço</h1><pre id="result" aria-live="polite">Carregando...</pre><script nonce="${nonce}">const token=location.hash.slice(1);const result=document.getElementById("result");if(!token){result.textContent="Link inválido ou incompleto."}else fetch("/api/public/work-orders/${id}",{headers:{"x-tracking-token":token}}).then(async response=>{if(!response.ok)throw new Error();result.textContent=JSON.stringify(await response.json(),null,2)}).catch(()=>{result.textContent="Não foi possível consultar a ordem. O link pode ter expirado."});</script></main></body></html>`;
  return { nonce, html };
}
