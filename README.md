# Minha Localizacao - React Native / Expo

Projeto simples feito para o exercicio de **Persistencia de dados e permissoes em React Native**.

## Objetivo

Demonstrar o uso de:

- AsyncStorage para salvar a preferencia de tema dark mode
- expo-location para solicitar permissao e capturar a localizacao atual
- expo-sqlite para salvar localizacoes em banco local
- Listagem das localizacoes recuperadas ao abrir o app

## Funcionalidades

- Alternar entre tema claro e escuro
- Persistir o tema escolhido no dispositivo
- Solicitar permissao de localizacao
- Capturar latitude e longitude atuais
- Salvar cada localizacao no SQLite
- Exibir a lista de localizacoes salvas
- Recuperar os dados ao abrir o app novamente

## Como rodar

Instale as dependencias:

```bash
npm install
```

Inicie o projeto:

```bash
npm start
```

Depois, abra no celular com o aplicativo Expo Go ou use um emulador Android/iOS.

## Bibliotecas usadas

```text
@react-native-async-storage/async-storage
expo-location
expo-sqlite
react-native-paper
```

## Observacao

O app precisa da permissao de localizacao do dispositivo para capturar e salvar a latitude e longitude reais.
