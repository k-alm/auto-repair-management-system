import { randomBytes } from "node:crypto";

export function renderApprovalPage(id: string) {
  const nonce = randomBytes(18).toString("base64");
  const html = `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Decisão do orçamento</title><body><main><h1>Decisão do orçamento</h1><p>Escolha uma opção para este orçamento:</p><button id="approve">Aprovar orçamento</button> <button id="reject">Rejeitar orçamento</button><p id="result" role="status"></p></main><script nonce="${nonce}">const token=location.hash.slice(1);const result=document.getElementById("result");for(const [id,decision] of [["approve","APPROVED"],["reject","REJECTED"]])document.getElementById(id).addEventListener("click",async()=>{if(!token){result.textContent="Link inválido ou incompleto.";return}for(const button of document.querySelectorAll("button"))button.disabled=true;try{const response=await fetch("/api/public/quotes/${id}/decision",{method:"POST",headers:{"content-type":"application/json","x-approval-token":token},body:JSON.stringify({decision})});result.textContent=response.ok?"Decisão registrada.":"Não foi possível registrar a decisão; o link pode ter expirado ou já ter sido utilizado."}catch{result.textContent="Não foi possível conectar. Tente novamente."}});</script></body></html>`;
  return { nonce, html };
}
