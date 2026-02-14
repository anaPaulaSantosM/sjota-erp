let pedidoEditando = null;
let itemEditando = null;
let clientesCache = [];
let produtosCache = [];

async function carregarPedidos() {
  const pedidos = await apiGet('/sales-orders');
  const itens = await apiGet('/sales-order-items');
  clientesCache = await apiGet('/customers');
  produtosCache = await apiGet('/products');

  const ul = document.getElementById('listaPedidos');
  ul.innerHTML = '';

  itens.forEach(item => {
    const pedido = pedidos.find(p => p.id === item.sales_order_id);
    if (!pedido) return;
    const cliente = clientesCache.find(c => c.id === pedido.customer_id);
    const produto = produtosCache.find(p => p.id === item.product_id);
    const valorTotal = (item.price * item.quantity).toFixed(2);
    ul.innerHTML += `
      <li style="display: flex; align-items: center; gap: 16px; padding: 8px 0; border-bottom: 1px solid #eee;">
        <span style="min-width: 80px; text-align: center;">${pedido.id}</span>
        <span style="min-width: 180px;">${cliente ? cliente.name : '-'}</span>
        <span style="min-width: 180px;">${produto ? produto.name : '-'}</span>
        <span style="min-width: 60px; text-align: center;">${item.quantity}</span>
        <span style="min-width: 120px; text-align: center;">${valorTotal}</span>
        <span style="min-width: 100px; text-align: center;">${pedido.status}</span>
        <button onclick="editarPedido(${item.id})"
          title="Editar"
          style="background: none; border: none; cursor: pointer; font-size: 16px; padding: 0 8px;">
          ✏️
        </button>
        <button onclick="excluirPedido(${item.id})"
          title="Excluir"
          style="background: none; border: none; cursor: pointer; font-size: 16px; padding: 0 8px;">
          🗑
        </button>
      </li>
    `;
  });
}

async function editarPedido(id) {
  const itens = await apiGet('/sales-order-items');
  const pedidos = await apiGet('/sales-orders');
  const item = itens.find(i => i.id === id);
  if (!item) return;
  const pedido = pedidos.find(p => p.id === item.sales_order_id);
  if (!pedido) return;
  pedidoEditando = pedido;
  itemEditando = item;
  const cliente = clientesCache.find(c => c.id === pedido.customer_id);
  const produto = produtosCache.find(p => p.id === item.product_id);
  const popup = document.getElementById('editorPedido');
  popup.style.display = 'flex';
  document.body.style.overflow = 'hidden'; // trava scroll
  document.getElementById('editorId').textContent = pedido.id;
  document.getElementById('editorCliente').textContent = cliente ? cliente.name : '-';
  document.getElementById('editorProduto').textContent = produto ? produto.name : '-';
  document.getElementById('editorStatus').value = pedido.status;
  document.getElementById('editorQuantidade').value = item.quantity;
  document.getElementById('editorValor').value = (item.price * item.quantity).toFixed(2);
}

function fecharEditorPedido() {
  pedidoEditando = null;
  itemEditando = null;
  document.getElementById('editorPedido').style.display = 'none';
  document.body.style.overflow = '';
}

async function salvarEdicaoPedido() {
  if (!pedidoEditando || !itemEditando) return;
  const novoStatus = document.getElementById('editorStatus').value;
  const novaQuantidade = parseInt(document.getElementById('editorQuantidade').value);
  const novoValorTotal = parseFloat(document.getElementById('editorValor').value);
  const novoValorUnitario = novaQuantidade > 0 ? (novoValorTotal / novaQuantidade) : 0;
  // Atualiza status do pedido
  await apiPut(`/sales-orders/${pedidoEditando.id}/status`, { status: novoStatus });
  // Atualiza item do pedido (valor unitário calculado a partir do total)
  await apiPut(`/sales-order-items/${itemEditando.id}`, { quantity: novaQuantidade, price: novoValorUnitario });
  fecharEditorPedido();
  carregarPedidos();
}

async function excluirPedido(id) {
  if (confirm('Deseja realmente excluir o item do pedido?')) {
    await apiDelete(`/sales-order-items/${id}`);
    carregarPedidos();
  }
}

carregarPedidos();
