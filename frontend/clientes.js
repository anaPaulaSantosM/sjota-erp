async function editarCliente(id) {
  const clientes = await apiGet('/customers');
  const cliente = clientes.find(c => c.id === id);
  if (!cliente) {
    alert('Cliente não encontrado!');
    return;
  }
  document.getElementById('name').value = cliente.name;
  document.getElementById('email').value = cliente.email;
  document.getElementById('phone').value = cliente.phone;
  // Armazenar o id do cliente para edição
  window.clienteEditandoId = id;
}
async function carregarClientes() {
  const clientes = await apiGet('/customers');
  const ul = document.getElementById('listaClientes');
  ul.innerHTML = '';

  clientes.forEach(c => {
    ul.innerHTML += `
      <li style="display: flex; align-items: center; gap: 16px; padding: 8px 0; border-bottom: 1px solid #eee;">
        <span style="min-width: 180px;">${c.name}</span>
        <span style="min-width: 180px;">${c.email}</span>
        <span style="min-width: 120px;">${c.phone}</span>
        <button onclick="editarCliente(${c.id})" title="Editar" style="background: none; border: none; cursor: pointer; font-size: 16px; padding: 0 8px;">✏️</button>
        <button onclick="excluirCliente(${c.id})" title="Excluir" style="background: none; border: none; cursor: pointer; font-size: 16px; padding: 0 8px;">🗑</button>
      </li>
    `;
  });
}

async function salvarCliente() {
  const nomeInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const phoneInput = document.getElementById('phone');
  const nome = nomeInput ? nomeInput.value.trim() : '';
  const email = emailInput ? emailInput.value.trim() : '';
  const phone = phoneInput ? phoneInput.value.trim() : '';

  if (!nome) {
    alert('O campo nome é obrigatório!');
    return;
  }

  // Se estiver editando, faz PUT, senão faz POST
  if (window.clienteEditandoId) {
    await apiPut(`/customers/${window.clienteEditandoId}`, {
      name: nome,
      email: email,
      phone: phone
    });
    window.clienteEditandoId = null;
  } else {
    await apiPost('/customers', {
      name: nome,
      email: email,
      phone: phone
    });
  }
  // Limpar campos do formulário
  nomeInput.value = '';
  emailInput.value = '';
  phoneInput.value = '';
  carregarClientes();
}

async function excluirCliente(id) {
  await apiDelete(`/customers/${id}`);
  carregarClientes();
}

carregarClientes();
