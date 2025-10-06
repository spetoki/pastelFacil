# Comandos Git Úteis

Este arquivo contém uma referência rápida para comandos Git úteis para gerenciar o histórico de commits do projeto.

## Ver todos os commits

Para ver uma lista detalhada de todos os commits, use o comando:

```bash
git log
```

Para uma visualização mais compacta, mostrando apenas o hash do commit e a mensagem, use:

```bash
git log --oneline
```

## Obter o hash do último commit

Para ver o hash (identificador único) do commit mais recente, você pode usar:

```bash
git log -1 --pretty=format:"%h"
```

O resultado será o hash curto do último commit (ex: `a1b2c3d`).

## Restaurar um commit específico

Para reverter o estado do seu projeto para um commit anterior, você pode usar o comando `git reset`. **Atenção: esta é uma ação destrutiva que descartará todas as alterações feitas após o commit escolhido.**

1.  Primeiro, encontre o hash do commit para o qual você deseja voltar usando `git log`.
2.  Depois, use o comando abaixo, substituindo `<hash-do-commit>` pelo identificador que você copiou:

```bash
git reset --hard <hash-do-commit>
```

**Exemplo:**

```bash
git reset --hard a1b2c3d
```

Isso fará com que seu código local volte exatamente para o estado em que estava no commit `a1b2c3d`.
