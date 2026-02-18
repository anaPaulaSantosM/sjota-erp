let idOrcamentoParaPedido = null;
let paymentMethods = [];

async function carregarPaymentMethods() {
  paymentMethods = await apiGet('/payment-methods');
  console.log(paymentMethods); // 👈 veja o que está vindo

  const select = document.getElementById('pedidoFormaPagamento');
  select.innerHTML = '<option value="">Selecione...</option>';

  paymentMethods.forEach(pm => {
    select.innerHTML += `<option value="${pm.id}">${pm.name}</option>`;
  });

  select.onchange = atualizarCamposPagamento;
  atualizarCamposPagamento();
}


function atualizarCamposPagamento() {
  const select = document.getElementById('pedidoFormaPagamento');
  const prazoContainer = document.getElementById('containerPrazo');
  const parcelasContainer = document.getElementById('containerParcelas');

  const id = select.value;
  const pm = paymentMethods.find(p => p.id == id);

  if (pm && pm.permite_prazo) {
    prazoContainer.style.display = 'block';
  } else {
    prazoContainer.style.display = 'none';
    document.getElementById('pedidoPrazo').value = '';
  }

  if (pm && pm.permite_parcelas) {
    parcelasContainer.style.display = 'block';
  } else {
    parcelasContainer.style.display = 'none';
    document.getElementById('pedidoParcelas').value = '';
  }
}


async function abrirModalPedido(itemId) {
  idOrcamentoParaPedido = itemId;

  document.getElementById('modalPedido').style.display = 'flex';

  try {
    if (paymentMethods.length === 0) {
      await carregarPaymentMethods();
    }
  } catch (error) {
    console.error('Erro ao carregar formas:', error);
    alert('Erro ao carregar formas de pagamento');
  }
}


function fecharModalPedido() {
  idOrcamentoParaPedido = null;
  document.getElementById('modalPedido').style.display = 'none';
  document.getElementById('pedidoFormaPagamento').value = '';
  document.getElementById('pedidoPrazo').value = '';
  document.getElementById('pedidoParcelas').value = '';
}

async function confirmarPedido() {
  if (!idOrcamentoParaPedido) return;

  // Busca dados do item de orçamento
  const itens = await apiGet('/quote-items');
  const orcamento = itens.find(i => i.id === idOrcamentoParaPedido);

  if (!orcamento) {
    alert('Orçamento não encontrado!');
    fecharModalPedido();
    return;
  }

  // Coleta dados do modal
  const formaPagamento = document.getElementById('pedidoFormaPagamento').value;
  const prazo = document.getElementById('pedidoPrazo').value;
  const parcelas = document.getElementById('pedidoParcelas').value;

  if (!formaPagamento) {
    alert('Selecione a forma de pagamento!');
    return;
  }

  // Se permitir prazo mas não preencheu
  const pm = paymentMethods.find(p => p.id == formaPagamento);

  if (pm?.permite_prazo && !prazo) {
    alert('Informe o prazo!');
    return;
  }

  if (pm?.permite_parcelas && !parcelas) {
    alert('Informe as parcelas!');
    return;
  }

  // Integração backend: cria pedido e baixa estoque
  try {
    // Cria pedido de vendas a partir do orçamento
    const pedido = await apiPost(`/sales-orders/from-quote/${orcamento.quote_id}`, {
      payment_method_id: formaPagamento,
      prazo,
      parcelas
    });
    // Atualiza status para 'Produção' (baixa estoque)
    await apiPut(`/sales-orders/${pedido.id}/status`, { status: 'Produção' });
    alert('Pedido gerado e estoque atualizado!');
  } catch (err) {
    alert('Erro ao gerar pedido: ' + (err.message || err));
  }
  fecharModalPedido();
}

let listaProdutos = [];

async function carregarCombos() {
  const clientes = await apiGet('/customers');
  const produtos = await apiGet('/products');

  listaProdutos = produtos; // ← guarda em memória

  const clienteSelect = document.getElementById('cliente');
  const produtoSelect = document.getElementById('produto');

  clienteSelect.innerHTML = '<option value="">Selecione...</option>';
  produtoSelect.innerHTML = '<option value="">Selecione...</option>';

  clientes.forEach(c => {
    clienteSelect.innerHTML += `<option value="${c.id}">${c.name}</option>`;
  });

  produtos.forEach(p => {
    produtoSelect.innerHTML += `<option value="${p.id}">${p.name}</option>`;
  });
}

function produtoSelecionado() {
  const produtoId = document.getElementById('produto').value;
  const precoUnitario = document.getElementById('precoUnitario');

  if (!produtoId) {
    precoUnitario.value = '';
    return;
  }

  const produto = listaProdutos.find(p => p.id == produtoId);

  if (produto) {
    precoUnitario.value = produto.price;
    calcularTotal(); // já recalcula automaticamente
  }
}

function calcularTotal() {
  const preco = parseFloat(document.getElementById('precoUnitario').value) || 0;
  const qtd = parseInt(document.getElementById('quantidade').value) || 0;

  document.getElementById('precoTotal').value = (preco * qtd).toFixed(2);
}

async function listarOrcamentos() {
  const orcamentos = await apiGet('/quotes');
  const itens = await apiGet('/quote-items');
  const clientes = await apiGet('/customers');
  const produtos = await apiGet('/products');

  const ul = document.getElementById('listaOrcamentos');
  ul.innerHTML = '';

  itens.forEach(item => {
    const orcamento = orcamentos.find(o => o.id === item.quote_id);
    const cliente = clientes.find(c => c.id === (orcamento ? orcamento.customer_id : null));
    const produto = produtos.find(p => p.id === item.product_id);
    console.log(item);
    ul.innerHTML += `
      <li style="display: flex; align-items: center; gap: 16px; padding: 8px 0; border-bottom: 1px solid #eee;">
        <span style="min-width: 80px; text-align: center;">${orcamento ? orcamento.id : '-'}</span>
        <span style="min-width: 180px;">${cliente ? cliente.name : '-'}</span>
        <span style="min-width: 180px;">${produto ? produto.name : '-'}</span>
        <span style="min-width: 60px; text-align: center;">${item.quantity}</span>
        <span style="min-width: 120px; text-align: center;">${item.pricetotal !== undefined ? item.pricetotal : '-'}</span>

        <button onclick="editarOrcamento(${item.id})"
          title="Editar"
          style="background: none; border: none; cursor: pointer; font-size: 16px; padding: 0 8px;">
          ✏️
        </button>

        <button onclick="excluirOrcamento(${item.id})"
          title="Excluir"
          style="background: none; border: none; cursor: pointer; font-size: 16px; padding: 0 8px;">
          🗑
        </button>

        <button onclick="abrirModalPedido(${item.id})"
          title="Transformar em Pedido"
          style="background: #b0c4de; color: #1f2937; border: none; cursor: pointer; font-size: 10px; padding: 0 8px; border-radius: 4px; margin-left: 8px;">
          Criar Pedido
        </button>
      </li>
    `;
  });
}

async function editarOrcamento(id) {
  const itens = await apiGet('/quote-items');
  const item = itens.find(i => i.id === id);

  if (!item) {
    alert('Item de orçamento não encontrado!');
    return;
  }

  document.getElementById('cliente').value = item.quote_id;
  document.getElementById('produto').value = item.product_id;
  document.getElementById('quantidade').value = item.quantity;
  document.getElementById('precoUnitario').value = item.priceunitario;
  document.getElementById('precoTotal').value = item.pricetotal;

  window.orcamentoEditandoId = id;
}

async function criarOrcamento() {
  const cliente = document.getElementById('cliente');
  const produto = document.getElementById('produto');
  const quantidade = document.getElementById('quantidade');
  const precoUnitario = document.getElementById('precoUnitario');
  const precoTotal = document.getElementById('precoTotal');

  if (!cliente.value || !produto.value) {
    alert('Cliente e Produto são obrigatórios!');
    return;
  }

  if (window.orcamentoEditandoId) {
    await apiPut(`/quote-items/${window.orcamentoEditandoId}`, {
      quote_id: cliente.value,
      product_id: produto.value,
      quantity: quantidade.value,
      priceunitario: precoUnitario.value,
      pricetotal: precoTotal.value
    });

    window.orcamentoEditandoId = null;

  } else {
    const quote = await apiPost('/quotes', {
      customer_id: cliente.value
    });

    await apiPost('/quote-items', {
      quote_id: quote.id,
      product_id: produto.value,
      quantity: quantidade.value,
      priceunitario: precoUnitario.value,
      pricetotal: precoTotal.value
    });
  }

  cliente.value = '';
  produto.value = '';
  quantidade.value = '';
  precoUnitario.value = '';
  precoTotal.value = '';

  listarOrcamentos();
}

async function excluirOrcamento(id) {
  if (confirm('Deseja realmente excluir o orçamento?')) {
    await apiDelete(`/quote-items/${id}`);
    listarOrcamentos();
  }
}

carregarCombos();
listarOrcamentos();
