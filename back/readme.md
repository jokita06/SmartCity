# Smart Hub

## Como rodar o projeto

### 1. Clonar o repositório

```bash
git clone https://github.com/jokita06/SmartCity.git
```

### 2. Abra a pasta back

```bash
cd ./back/
```

### 3. Crie um ambiente virtual

```bash
python -m venv .env
```

### 4. Ative o ambiente virtual

```bash
./.env/Scripts/activate
```

### 5. instale as dependências

```bash
pip install -r requirements.txt
```

### 6. Faça as migrações do banco

```bash
python manage.py migrate
```

### 7. Crie um Superusuário

```bash
python manage.py createsuperuser
```

### 8. Inicie o servidor

```bash
python manage.py runserver
```