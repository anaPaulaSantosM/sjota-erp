async function carregarProdutos() {
  const produtos = await apiGet('/products');
  const ul = document.getElementById('listaProdutos');
  ul.innerHTML = '';

  produtos.forEach(p => {
    ul.innerHTML += `
      <li style="display: flex; align-items: center; gap: 16px; padding: 8px 0; border-bottom: 1px solid #eee;">
        <span style="width: 60px; display: inline-block;">${p.id}</span>
        <span style="width: 120px; display: inline-block;">${p.name}</span>
        <span style="width: 120px; display: inline-block;">${p.stock}</span>
        <span style="width: 120px; display: inline-block; text-align: center;">
          <button onclick="editarProduto(${p.id})" title="Editar" style="background: none; border: none; cursor: pointer; font-size: 16px; padding: 0;">✏️</button>
        </span>
        <span style="width: 120px; display: inline-block; text-align: center;">
          <button onclick="excluirProduto(${p.id})" title="Excluir" style="background: none; border: none; cursor: pointer; font-size: 16px; padding: 0;">🗑</button>
        </span>
      </li>
    `;
  });
}

async function salvarProduto() {
  const nomeInput = document.getElementById('nome');
  const precoInput = document.getElementById('preco');
  const estoqueInput = document.getElementById('estoque');
  const nome = nomeInput ? nomeInput.value.trim() : '';
  const preco = precoInput ? precoInput.value.trim() : '';
  const estoque = estoqueInput ? estoqueInput.value.trim() : '';

  if (!nome) {
    alert('O campo nome é obrigatório!');
    return;
  }

  if (window.produtoEditandoId) {
    await apiPut(`/products/${window.produtoEditandoId}`, {
      name: nome,
      price: preco,
      stock: estoque
    });
    window.produtoEditandoId = null;
  } else {
    await apiPost('/products', {
      name: nome,
      price: preco,
      stock: estoque
    });
  }
  nomeInput.value = '';
  precoInput.value = '';
  estoqueInput.value = '';
  carregarProdutos();
}

async function editarProduto(id) {
  const produtos = await apiGet('/products');
  const produto = produtos.find(p => p.id === id);
  if (!produto) {
    alert('Produto não encontrado!');
    return;
  }
  document.getElementById('nome').value = produto.name;
  document.getElementById('preco').value = produto.price;
  document.getElementById('estoque').value = produto.stock;
  window.produtoEditandoId = id;
}

async function excluirProduto(id) {
  await apiDelete(`/products/${id}`);
  carregarProdutos();
}

carregarProdutos();
