
const PRODUTOS = [
  {id:1, emoji:"🎧", nome:"Fone de ouvido Bluetooth com cancelamento de ruído", preco:249.90, de:399.90, nota:4.5, aval:12840, desc:"Até 30 horas de bateria, microfone embutido e conexão estável com Bluetooth 5.3. Acompanha estojo de transporte e cabo USB-C."},
  {id:2, emoji:"⌚", nome:"Smartwatch com monitor de batimentos e GPS", preco:329.00, de:499.00, nota:4.2, aval:5320, desc:"Tela AMOLED, resistência à água 5 ATM, mais de 100 modos esportivos e notificações do celular no pulso."},
  {id:3, emoji:"📚", nome:"Kit 3 livros de desenvolvimento pessoal", preco:89.90, de:129.90, nota:4.8, aval:2150, desc:"Três best-sellers em capa comum. Ótimo para começar a criar bons hábitos."},
  {id:4, emoji:"☕", nome:"Cafeteira elétrica programável 1,2 L", preco:159.90, de:219.90, nota:4.4, aval:8710, desc:"Programe o horário e acorde com café fresco. Jarra de vidro térmica e filtro permanente."},
  {id:5, emoji:"🎮", nome:"Controle sem fio para console e PC", preco:279.00, de:349.00, nota:4.7, aval:19230, desc:"Gatilhos adaptáveis, vibração de alta precisão e bateria recarregável de longa duração."},
  {id:6, emoji:"🎒", nome:"Mochila impermeável para notebook 15,6\"", preco:119.90, de:189.90, nota:4.6, aval:6480, desc:"Porta USB para carregamento, compartimentos organizados e zíperes reforçados."},
  {id:7, emoji:"💡", nome:"Lâmpada inteligente Wi-Fi RGB (2 unidades)", preco:79.90, de:119.90, nota:4.3, aval:3920, desc:"Controle por aplicativo ou voz, 16 milhões de cores e programação de horários."},
  {id:8, emoji:"📱", nome:"Smartphone 128 GB, câmera tripla de 50 MP", preco:1299.00, de:1699.00, nota:4.4, aval:25010, desc:"Tela de 6,6 polegadas 120 Hz, bateria de 5000 mAh e carregamento rápido."}
];


const $ = (s) => document.querySelector(s);
const moeda = (v) => v.toLocaleString("pt-BR", {style:"currency", currency:"BRL"});
const estrelas = (n) => "★".repeat(Math.round(n)) + "☆".repeat(5 - Math.round(n));
const precoHTML = (v) => { const [r, c] = v.toFixed(2).split("."); return `<small>R$</small>${Number(r).toLocaleString("pt-BR")}<small>${c}</small>`; };
const lerLS = (k, padrao) => { try { return JSON.parse(localStorage.getItem(k)) ?? padrao; } catch { return padrao; } };
const salvarLS = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

let usuario = lerLS("usuario", null);
let carrinho = lerLS("carrinho", []); // [{id, qtd}]


function mostrar(id){
  document.querySelectorAll(".view").forEach(v => v.classList.remove("ativa"));
  $("#" + id).classList.add("ativa");
}

function rotear(){
  if (!usuario){ $("#app").hidden = true; mostrar("view-login"); return; }
  $("#app").hidden = false;
  $("#nome-usuario").textContent = usuario.nome;
  const hash = location.hash || "#home";
  if (hash.startsWith("#produto-")){
    const p = PRODUTOS.find(x => x.id === Number(hash.split("-")[1]));
    if (p){ abrirProduto(p); return; }
  }
  mostrar("view-home");
  renderLista($("#busca-input").value);
}


function entrar(){
  const email = $("#email").value.trim();
  const senha = $("#senha").value;
  const erro = $("#login-erro");
  if (!/^\S+@\S+\.\S+$/.test(email)) { erro.textContent = "Digite um e-mail válido."; return; }
  if (senha.length < 6) { erro.textContent = "A senha precisa ter pelo menos 6 caracteres."; return; }
  erro.textContent = "";
  usuario = { email, nome: email.split("@")[0] };
  salvarLS("usuario", usuario);
  location.hash = "#home";
  rotear();
}
$("#btn-login").addEventListener("click", entrar);
$("#senha").addEventListener("keydown", e => { if (e.key === "Enter") entrar(); });
$("#email").addEventListener("keydown", e => { if (e.key === "Enter") $("#senha").focus(); });

$("#btn-sair").addEventListener("click", () => {
  usuario = null;
  localStorage.removeItem("usuario");
  $("#senha").value = "";
  rotear();
});


function renderLista(filtro = ""){
  const termo = filtro.trim().toLowerCase();
  const itens = PRODUTOS.filter(p => p.nome.toLowerCase().includes(termo));
  $("#lista").innerHTML = itens.length ? itens.map(p => `
    <a class="card" href="#produto-${p.id}">
      <div class="img" aria-hidden="true">${p.emoji}</div>
      <h3>${p.nome}</h3>
      <div class="nota"><span class="estrelas">${estrelas(p.nota)}</span> ${p.aval.toLocaleString("pt-BR")}</div>
      <div class="preco">${precoHTML(p.preco)}</div>
      <div class="de">De: ${moeda(p.de)}</div>
    </a>`).join("") : `<p class="vazio">Nenhum resultado para "${filtro}". Tente outra palavra.</p>`;
}

$("#busca").addEventListener("submit", e => {
  e.preventDefault();
  if (location.hash !== "#home") location.hash = "#home"; else rotear();
});


let produtoAtual = null;
function abrirProduto(p){
  produtoAtual = p;
  $("#p-img").textContent = p.emoji;
  $("#p-titulo").textContent = p.nome;
  $("#p-nota").innerHTML = `${p.nota.toString().replace(".", ",")} <span class="estrelas">${estrelas(p.nota)}</span> · ${p.aval.toLocaleString("pt-BR")} avaliações`;
  $("#p-preco").innerHTML = precoHTML(p.preco) + `<div class="de">De: ${moeda(p.de)}</div>`;
  $("#p-preco2").innerHTML = precoHTML(p.preco);
  $("#p-desc").textContent = p.desc;
  $("#p-qtd").value = "1";
  mostrar("view-produto");
  window.scrollTo(0, 0);
}

function adicionar(){
  const qtd = Number($("#p-qtd").value);
  const item = carrinho.find(i => i.id === produtoAtual.id);
  item ? item.qtd += qtd : carrinho.push({ id: produtoAtual.id, qtd });
  salvarLS("carrinho", carrinho);
  atualizarCarrinho();
  aviso("Adicionado ao carrinho");
}
$("#btn-add").addEventListener("click", adicionar);
$("#btn-comprar").addEventListener("click", () => { adicionar(); aviso("Compra simulada. Pedido confirmado!"); });

function atualizarCarrinho(){
  $("#carrinho-qtd").textContent = carrinho.reduce((s, i) => s + i.qtd, 0);
}

let t;
function aviso(msg){
  const el = $("#toast");
  el.textContent = msg;
  el.classList.add("on");
  clearTimeout(t);
  t = setTimeout(() => el.classList.remove("on"), 2200);
}

// ===== Início =====
window.addEventListener("hashchange", rotear);
atualizarCarrinho();
rotear();
