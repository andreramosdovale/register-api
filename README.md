<h2>API de resgistro de usuário</h3>
<hr>

<h4>Sistema de gerenciamento de contas desenvolvido em Node.js com os seguintes recursos:</h4>

<ul>
    <li>Criação de novos usuários</li>
    <li>Visualização dos dados salvos</li>
    <li>Alteração dos dados salvos</li>
    <li>Exclusão dos dados salvos</li>
    <li>Envio de uma nova senha aleatória por email (Em desenvolvimento)</li>
    <li>Criação de token JWT</li>
</ul>

<hr>

<h4>Instalação e configuração</h4>
<ol>
    <li>Instale o <a href="https://nodejs.org/en/download/">Node.js</a> e algum banco de dados relacional, neste projeto utilizei o <a href="https://www.postgresql.org/download/windows/">Postgres</a>.</li>
    <li>Clone este repositorio e instale suas dependencias.
        <ul class="command-class">
            <li>git clone git@github.com:andreramosdovale/register-api.git resgister-api</li>
            <li>cd resgister-api</li>
            <li>npm install</li>
        </ul>
    </li>
    <li>Configure o banco de dados
        <ul>
            <li>Crie um banco de dados com o comando:
                <ul>
                    <li>create database api</li>
                </ul>
            </li>
            <li>Altere os dados do arquivo src/knexfile.js para as suas configurações de banco de dados</li>
            <li>Utilize o comando abaixo para criar as tabelas do banco de dados:
                <ul>
                    <li>knex migrate:latest</li>
                </ul>
            </li>
        </ul>
    </li>
    <li>Utilize o comando abaixo para rodar a aplicação
        <ul>
            <li>npm start</li>
        </ul>
    </li>
</ol>
