cat > bcb-rbac-admin-v2/README.txt << 'EOF'
RBAC — Banco Central das Bets (bcb-rbac-admin-v2)

1) Baixe a chave de serviço no Console Firebase:
   - Console Firebase → Configurações do projeto → Contas de serviço → Gerar nova chave privada
   - Salve o arquivo como: bcb-rbac-admin-v2/serviceAccountKey.json
   - (NÃO COMMITAR esse arquivo em repositórios públicos)

2) Instale as dependências:
   cd bcb-rbac-admin-v2
   npm install

3) Marque um usuário como admin (custom claim):
   # por e-mail
   node set-claim-admin.js --email "SEU_EMAIL_GOOGLE@dominio.com" --admin true
   # ou por UID
   node set-claim-admin.js --uid "SEU_UID" --admin true

4) (Opcional) Remover privilégio admin:
   node set-claim-admin.js --email "SEU_EMAIL_GOOGLE@dominio.com" --admin false

5) Listar usuários e claims:
   node list-users.js

6) Importante:
   - Após definir admin, o usuário deve SAIR e ENTRAR novamente no painel Admin
     para o token atualizar e refletir as claims.
   - Este pacote usa firebase-admin e requer serviceAccountKey.json válido.

EOF
