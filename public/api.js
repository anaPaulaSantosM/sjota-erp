const API_URL = '/api';

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': localStorage.getItem('token')
  };
}

async function apiGet(endpoint) {
  const res = await fetch(API_URL + endpoint, {
    headers: getHeaders()
  });
  return res.json();
}

async function apiPost(endpoint, data) {
  const res = await fetch(API_URL + endpoint, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return res.json();
}

async function apiPut(endpoint, data) {
  const res = await fetch(API_URL + endpoint, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return res.json();
}

async function apiDelete(endpoint) {
  const res = await fetch(API_URL + endpoint, {
    method: 'DELETE',
    headers: getHeaders()
  });
  return res.json();
}
