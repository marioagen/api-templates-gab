import { ApiTemplate } from '../types';

export const mockApiTemplates: ApiTemplate[] = [
  {
    id: crypto.randomUUID(),
    name: 'Get User Details',
    method: 'GET',
    url: 'https://jsonplaceholder.typicode.com/users/1',
    headers: [],
    queryParams: [],
    body: '',
    createdAt: Date.now() - 100000,
  },
  {
    id: crypto.randomUUID(),
    name: 'List All Posts',
    method: 'GET',
    url: 'https://jsonplaceholder.typicode.com/posts',
    headers: [],
    queryParams: [
      { id: crypto.randomUUID(), key: 'userId', value: '1' }
    ],
    body: '',
    createdAt: Date.now() - 200000,
  },
  {
    id: crypto.randomUUID(),
    name: 'Create a New Post',
    method: 'POST',
    url: 'https://jsonplaceholder.typicode.com/posts',
    headers: [
      { id: crypto.randomUUID(), key: 'Content-type', value: 'application/json; charset=UTF-8', isSecret: false }
    ],
    queryParams: [],
    body: JSON.stringify({
      title: '{{postTitle}}',
      body: '{{postBody}}',
      userId: 1
    }, null, 2),
    createdAt: Date.now() - 300000,
  },
  {
    id: crypto.randomUUID(),
    name: 'Update a Photo',
    method: 'PUT',
    url: 'https://jsonplaceholder.typicode.com/photos/100',
    headers: [
      { id: crypto.randomUUID(), key: 'Content-type', value: 'application/json; charset=UTF-8', isSecret: false }
    ],
    queryParams: [],
    body: JSON.stringify({
      albumId: 1,
      id: 100,
      title: '{{newPhotoTitle}}',
      url: 'https://via.placeholder.com/600/771796',
      thumbnailUrl: 'https://via.placeholder.com/150/771796'
    }, null, 2),
    createdAt: Date.now() - 400000,
  },
  {
    id: crypto.randomUUID(),
    name: 'Delete a Comment',
    method: 'DELETE',
    url: 'https://jsonplaceholder.typicode.com/comments/5',
    headers: [],
    queryParams: [],
    body: '',
    createdAt: Date.now() - 500000,
  },
  {
    id: crypto.randomUUID(),
    name: 'Patch a Todo Item',
    method: 'PATCH',
    url: 'https://jsonplaceholder.typicode.com/todos/20',
    headers: [
      { id: crypto.randomUUID(), key: 'Content-type', value: 'application/json; charset=UTF-8', isSecret: false }
    ],
    queryParams: [],
    body: JSON.stringify({
      completed: true
    }, null, 2),
    createdAt: Date.now() - 600000,
  },
  {
    id: crypto.randomUUID(),
    name: 'Get Weather Forecast',
    method: 'GET',
    url: 'https://api.weather.gov/points/39.7456,-97.0892',
    headers: [
        { id: crypto.randomUUID(), key: 'User-Agent', value: '(my-weather-app, contact@email.com)', isSecret: false }
    ],
    queryParams: [],
    body: '',
    createdAt: Date.now() - 700000,
  },
  {
    id: crypto.randomUUID(),
    name: 'Search for Cat Facts',
    method: 'GET',
    url: 'https://catfact.ninja/facts',
    headers: [],
    queryParams: [
      { id: crypto.randomUUID(), key: 'limit', value: '5' },
      { id: crypto.randomUUID(), key: 'max_length', value: '140' }
    ],
    body: '',
    createdAt: Date.now() - 800000,
  },
  {
    id: crypto.randomUUID(),
    name: 'Authenticate User',
    method: 'POST',
    url: 'https://dummyjson.com/auth/login',
    headers: [
      { id: crypto.randomUUID(), key: 'Content-Type', value: 'application/json', isSecret: false },
      { id: crypto.randomUUID(), key: 'Authorization', value: 'Bearer {{authToken}}', isSecret: true }
    ],
    queryParams: [],
    body: JSON.stringify({
      username: '{{user}}',
      password: '{{password}}'
    }, null, 2),
    createdAt: Date.now() - 900000,
  },
  {
    id: crypto.randomUUID(),
    name: 'List Products by Category',
    method: 'GET',
    url: 'https://dummyjson.com/products/category/smartphones',
    headers: [],
    queryParams: [],
    body: '',
    createdAt: Date.now() - 1000000,
  },
  {
    id: crypto.randomUUID(),
    name: 'Add New Product',
    method: 'POST',
    url: 'https://dummyjson.com/products/add',
    headers: [
        { id: crypto.randomUUID(), key: 'Content-Type', value: 'application/json', isSecret: false }
    ],
    queryParams: [],
    body: JSON.stringify({
        title: 'iPhone Galaxy +1'
    }, null, 2),
    createdAt: Date.now() - 1100000,
  },
  {
    id: crypto.randomUUID(),
    name: 'Delete User Account',
    method: 'DELETE',
    url: 'https://dummyjson.com/users/1',
    headers: [],
    queryParams: [],
    body: '',
    createdAt: Date.now() - 1200000,
  },
];
