document.addEventListener('DOMContentLoaded', async () => {
    const resp = await fetch('getClassificacao.php'); // ou sua rota API
    const dados = await resp.json();

    preencherLista('leitoresExtremos', dados.extremos);
    preencherLista('leitoresAtivos', dados.ativos);
    preencherLista('leitoresRegulares', dados.regulares);
});

function preencherLista(id, leitores) {
    const div = document.getElementById(id);
    div.innerHTML = '';
    leitores.forEach(l => {
        const p = document.createElement('p');
        p.textContent = l.nome;
        div.appendChild(p);
    });
}
