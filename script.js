$(document).ready(function(){
    function activateState(stateCode) {
        $('#map .state').removeClass('active');
        $('.parca .estado').removeClass('active');
        if (stateCode) {
            $('#state_' + stateCode).addClass('active');
            $('#box_' + stateCode).addClass('active');
            $('#seletory').val(stateCode);
        }
    }

    $('#map .state').click(function(e){
        e.preventDefault();
        var estado = $(this).attr('data-state');
        activateState(estado);
    });

    $('#seletory').change(function(){
        var estado = $(this).val();
        activateState(estado);
    });

    activateState('mg');
});

  // --- Perguntas 1..20 (sem 3A aqui) ---
  const perguntas = [
    '1. A violência física aumentou em gravidade ou frequência no último ano?',
    '2. Ele possui arma de fogo?',
    '3. Você o deixou após terem morado juntos no último ano?',
    '4. Ele está desempregado?',
    '5. Já usou uma arma potencialmente letal contra você ou ameaçou com arma letal?',
    '6. Ele ameaça te matar?',
    '7. Ele evitou ser preso por violência doméstica?',
    '8. Você tem um filho que não é dele?',
    '9. Ele já a forçou a ter relações sexuais quando você não queria?',
    '10. Ele tenta te estrangular/sufocar?',
    '11. Ele usa drogas ilegais?',
    '12. Ele é alcoólatra ou bebedor problemático?',
    '13. Ele controla a maior parte das suas atividades diárias?',
    '14. Ele é violentamente e constantemente ciumento?',
    '15. Você já foi agredida por ele durante a gravidez?',
    '16. Ele já ameaçou ou tentou cometer suicídio?',
    '17. Ele ameaça ferir seus filhos?',
    '18. Você tem medo de que ele possa te matar?',
    '19. Ele te persegue, espiona ou deixa mensagens ameaçadoras?',
    '20. Você já ameaçou ou tentou cometer suicídio?'
  ];

  // Pesos EXTRAS validados neste projeto (soma máx total = 34)
  // Base: cada "Sim" (Q1..Q20) = 1 ponto
  // Extras: Q2 +4, Q3 +4, Q4 +3, Q5 +2, Q6 +2, Q7 +2, Q8 +1, Q9 +1
  // Regra especial: 3A (checkbox) = -3 e desabilita Q3
  const pesosExtras = { q2:4, q3:4, q4:3, q5:2, q6:2, q7:2, q8:1, q9:1 };
  const MAXIMO = 34; // normalizado

  // Renderiza perguntas
  const cont = document.getElementById('listaPerguntas');
  const tpl = document.getElementById('tplPergunta');
  perguntas.forEach((texto,i)=>{
    const n = i+1;
    const clone = tpl.content.cloneNode(true);
    const root = clone.querySelector('.item');
    const p = clone.querySelector('.pergunta');
    p.textContent = texto;
    const radios = clone.querySelectorAll('input[type="radio"]');
    radios.forEach(r=>{ r.setAttribute('name','q'+n); });
    cont.appendChild(clone);
  });

  // 3A desativa Q3
  const q3a = document.getElementById('q3a');
  q3a.addEventListener('change',()=>{
    const radiosQ3 = document.querySelectorAll('input[name="q3"]');
    if(q3a.checked){
      radiosQ3.forEach(r=>{ r.checked=false; r.disabled=true; });
    } else {
      radiosQ3.forEach(r=>{ r.disabled=false; });
    }
  });

  // Modal/tooltip simples dos pesos
  document.getElementById('btnPesos').addEventListener('click',()=>{
    const linhas = [
      'Peso base: cada "Sim" nas Q1..Q20 = 1 ponto (3A não pontua).',
      'Pesos extras: Q2(+4), Q3(+4), Q4(+3), Q5(+2), Q6(+2), Q7(+2), Q8(+1), Q9(+1).',
      'Regra especial: marcar 3A aplica -3 (e torna Q3 incompatível).',
      'Máximo da escala: 34.'
    ];
    alert(linhas.join('\n'));
  });

  // Cálculo
  $('#riskAssessmentForm').on('submit', function(e){
    e.preventDefault();

    let scoreBase = 0;    // soma de 1 ponto por "Sim"
    let scoreExtras = 0;  // pesos extras
    let debug = [];

    for(let i=1;i<=20;i++){
      const name = 'q'+i;
      const yes = $(`input[name="${name}"][value="sim"]`).is(':checked');
      if(yes){
        scoreBase += 1; // ponto base
        if(pesosExtras[name]) scoreExtras += pesosExtras[name];
      }
    }

    // 3A: -3 e desabilita Q3 (já tratado no UI)
    if(q3a.checked){ scoreExtras -= 3; debug.push('3A marcado: -3'); }

    let score = scoreBase + scoreExtras;

    // Normalização: garantir teto de 34 para manter a mesma escala utilizada no projeto/planilha
    if(score > MAXIMO){ score = MAXIMO; debug.push(`Ajuste de teto aplicado: ${MAXIMO}`); }

    // Render resultado
    const resultArea = $('#resultArea');
    const resultTitle = $('#resultTitle');
    const resultText = $('#resultText');
    const pct = Math.round((score / MAXIMO) * 100);

    $('#scoreValue').text(score);
    $('#scorePct').text(`(${pct}%)`);

    // reset classes
    resultTitle.removeClass('text-green-600 text-yellow-600 text-orange-600 text-red-600');

    if(score <= 7){
      resultTitle.text('Risco Variável').addClass('text-green-600');
      resultText.html('Seu resultado indica <strong>risco variável</strong>. Permaneça vigilante e procure informações sobre seus direitos.');
    } else if(score <= 13){
      resultTitle.text('Risco Aumentado').addClass('text-yellow-600');
      resultText.html('Há <strong>risco aumentado</strong>. Considere buscar apoio e orientação pelo <strong>180</strong>.');
    } else if(score <= 17){
      resultTitle.text('Risco Grave').addClass('text-orange-600');
      resultText.html('<strong>Atenção!</strong> Indícios de <strong>risco grave</strong>. Procure ajuda especializada. Ligue <strong>180</strong> ou procure uma DEAM.');
    } else {
      resultTitle.text('Risco Extremo').addClass('text-red-600');
      resultText.html('<strong>PERIGO!</strong> Indícios de <strong>risco extremo</strong>. Em emergência, ligue <strong>190</strong>; para orientação, <strong>180</strong>.');
    }

    // Caixa debug opcional
    const dbg = document.getElementById('debugBox');
    const dbgText = document.getElementById('debugText');
    dbg.hidden = false;
    dbgText.textContent = `Base = ${scoreBase}\nExtras = ${scoreExtras}\nTotal (ajustado ao teto 34) = ${score}`;

    resultArea.removeClass('hidden');
    window.scrollTo({top: resultArea[0].offsetTop - 100, behavior:'smooth'});
  });
  