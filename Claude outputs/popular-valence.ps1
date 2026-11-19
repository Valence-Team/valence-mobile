param(
    [string]$Api = "http://localhost:8080",
    [Parameter(Mandatory = $true)][string]$AgronomoEmail,
    [Parameter(Mandatory = $true)][string]$AgronomoSenha,
    [Parameter(Mandatory = $true)][string]$SenhaProdutores,
    [string]$PastaFotos = ""
)

$ErrorActionPreference = "Stop"
$Municipio = "Ribeirão Preto"
$Uf = "SP"

# -- Funções de apoio

function Chamar-Api {
    param([string]$Metodo, [string]$Caminho, $Corpo = $null, [string]$Token = "", [hashtable]$Cabecalhos = @{})
    $headers = @{} + $Cabecalhos
    if ($Token) { $headers["Authorization"] = "Bearer $Token" }
    $parametros = @{ Method = $Metodo; Uri = "$Api$Caminho"; Headers = $headers }
    if ($null -ne $Corpo) {
        $json = $Corpo | ConvertTo-Json -Depth 6
        $parametros["Body"] = [System.Text.Encoding]::UTF8.GetBytes($json)
        $parametros["ContentType"] = "application/json; charset=utf-8"
    }
    return Invoke-RestMethod @parametros
}

function Status-Do-Erro($erro) {
    if ($erro.Exception.Response) { return [int]$erro.Exception.Response.StatusCode }
    return 0
}

function Entrar([string]$Email, [string]$Senha) {
    $r = Chamar-Api POST "/api/auth/login" @{ email = $Email; senha = $Senha }
    return $r.token
}

function Garantir-Produtor([string]$Nome, [string]$Email) {
    try {
        $r = Chamar-Api POST "/api/auth/registrar" @{ nome = $Nome; email = $Email; senha = $SenhaProdutores; municipio = $Municipio; uf = $Uf }
        Write-Host "  cadastrado: $Email"
        if ($r.token) { return $r.token }
    } catch {
        if ((Status-Do-Erro $_) -ne 409) { throw }
        Write-Host "  já existia: $Email"
    }
    return Entrar $Email $SenhaProdutores
}

function Criar-Propriedade([string]$Token, [string]$Nome, [double]$Lat, [double]$Lon, [double]$Area, [string[]]$Culturas) {
    $p = Chamar-Api POST "/api/propriedades" @{
        nome = $Nome; municipio = $Municipio; uf = $Uf
        latitude = $Lat; longitude = $Lon; areaHectares = $Area; culturas = $Culturas
    } $Token
    Write-Host "  propriedade $($p.id): $Nome"
    return $p
}

$fotos = @()
if ($PastaFotos -and (Test-Path $PastaFotos)) {
    $fotos = @(Get-ChildItem $PastaFotos -File | Where-Object { $_.Extension -match '^\.(jpe?g|png|webp)$' })
}
$indiceFoto = 0

function Criar-Ocorrencia([string]$Token, $Propriedade, [string]$Cultura, [string]$Descricao) {
    $o = Chamar-Api POST "/api/ocorrencias" @{ propriedadeId = $Propriedade.id; cultura = $Cultura; descricao = $Descricao } $Token @{ "Idempotency-Key" = [guid]::NewGuid().ToString() }
    if ($script:fotos.Count -gt 0) {
        $arquivo = $script:fotos[$script:indiceFoto % $script:fotos.Count].FullName
        $script:indiceFoto++
        & curl.exe -s -o NUL -X POST -H "Authorization: Bearer $Token" -F "foto=@$arquivo" "$Api/api/ocorrencias/$($o.id)/fotos"
        Write-Host "  ocorrência $($o.id) com foto"
    } else {
        try {
            Chamar-Api POST "/api/ocorrencias/$($o.id)/triagem" $null $Token | Out-Null
            Write-Host "  ocorrência $($o.id) triada pelo texto"
        } catch {
            Write-Host "  ocorrência $($o.id) criada, triagem não rodou ($(Status-Do-Erro $_))"
        }
    }
    return $o
}

function Publicar([string]$Token, [string]$Texto) {
    return Chamar-Api POST "/api/mural" @{ texto = $Texto; municipio = $Municipio; uf = $Uf } $Token
}

function Comentar([string]$Token, $Post, [string]$Texto) {
    Chamar-Api POST "/api/mural/$($Post.id)/comentarios" @{ texto = $Texto } $Token | Out-Null
}

# -- Produtores

Write-Host "Produtores"
$tAna = Garantir-Produtor "Ana Ferreira" "ana.ferreira@valence.dev"
$tJoao = Garantir-Produtor "João Batista" "joao.batista@valence.dev"
$tLucia = Garantir-Produtor "Lúcia Andrade" "lucia.andrade@valence.dev"

# -- Propriedades (vizinhas, a menos de 10 km uma da outra)

Write-Host "Propriedades"
$pAna1 = Criar-Propriedade $tAna "Sítio Boa Esperança" -21.1775 -47.8103 12.5 @("MILHO", "TOMATE")
$pAna2 = Criar-Propriedade $tAna "Chácara Santa Clara" -21.2010 -47.7905 4.0 @("BATATA")
$pJoao = Criar-Propriedade $tJoao "Fazenda Três Irmãos" -21.1590 -47.8350 30.0 @("MILHO")
$pLucia = Criar-Propriedade $tLucia "Sítio Recanto Verde" -21.1920 -47.8230 8.0 @("TOMATE", "BATATA")

# -- Ocorrências

Write-Host "Ocorrências"
$o1 = Criar-Ocorrencia $tAna $pAna1 "MILHO" "Folhas com faixas avermelhadas e plantas menores que o normal. Vi muitas cigarrinhas no cartucho."
$o2 = Criar-Ocorrencia $tAna $pAna1 "TOMATE" "Manchas escuras com anéis nas folhas de baixo, que estão amarelando e caindo."
$o3 = Criar-Ocorrencia $tJoao $pJoao "MILHO" "Pústulas alaranjadas nas duas faces da folha, soltando um pó quando passo a mão."
$o4 = Criar-Ocorrencia $tLucia $pLucia "BATATA" "Manchas marrons encharcadas nas folhas depois das chuvas, com mofo branco embaixo."
$o5 = Criar-Ocorrencia $tLucia $pLucia "TOMATE" "Frutos com manchas pretas no fundo, do lado oposto ao cabo."
$o6 = Criar-Ocorrencia $tAna $pAna2 "BATATA" "Algumas plantas murchando durante o dia, mesmo com o solo úmido."

# -- Laudos do agrônomo

Write-Host "Laudos"
$tAgro = Entrar $AgronomoEmail $AgronomoSenha
$fila = Chamar-Api GET "/api/analises?page=0&size=50" $null $tAgro
$naFila = @($fila.content | ForEach-Object { $_.id })

function Emitir-Laudo($Ocorrencia, [string]$Decisao, [string]$Praga, [string]$Parecer) {
    if ($script:naFila -notcontains $Ocorrencia.id) {
        Write-Host "  ocorrência $($Ocorrencia.id) fora da fila de análise, laudo não emitido"
        return
    }
    $corpo = @{ decisao = $Decisao; parecer = $Parecer }
    if ($Praga) { $corpo["pragaConfirmada"] = $Praga }
    Chamar-Api POST "/api/ocorrencias/$($Ocorrencia.id)/laudo" $corpo $script:tAgro | Out-Null
    Write-Host "  ocorrência $($Ocorrencia.id): $Decisao"
}

Emitir-Laudo $o1 "CONFIRMADA" "Cigarrinha-do-milho (enfezamento)" "Sintomas típicos de enfezamento com presença do vetor. Recomenda-se monitorar as lavouras vizinhas e procurar a assistência técnica."
Emitir-Laudo $o3 "CONFIRMADA" "Ferrugem comum do milho" "Pústulas características de ferrugem comum. Acompanhar a evolução nas próximas semanas."
Emitir-Laudo $o5 "DESCARTADA" "" "Podridão apical é um distúrbio fisiológico ligado à falta de cálcio e irrigação irregular, não é praga."
Emitir-Laudo $o6 "MAIS_INFORMACOES" "" "Enviar foto do corte do caule e informar há quantos dias a murcha começou."

# -- Mural

Write-Host "Mural"
$post1 = Publicar $tJoao "Alguém mais está vendo cigarrinha no milho aqui na região? Na minha lavoura apareceu bastante nesta semana."
Comentar $tAna $post1 "Aqui também. Registrei uma ocorrência e o agrônomo confirmou enfezamento."
Comentar $tLucia $post1 "Vou olhar o milho do vizinho amanhã cedo."
$post2 = Publicar $tLucia "Com a chuva dos últimos dias, fiquem de olho na requeima da batata e do tomate."
Comentar $tJoao $post2 "Obrigado pelo aviso."
$post3 = Publicar $tAna "Troco mudas de tomate por sementes de milho crioulo. Interessados comentem aqui."
$post4 = Publicar $tJoao "Para acabar com a praga, misture o dobro da dose do veneno com óleo queimado e passe em tudo."

# -- Denúncias (abastecem a fila de moderação)

Write-Host "Denúncias"
foreach ($t in @($tAna, $tLucia)) {
    try {
        Chamar-Api POST "/api/mural/$($post4.id)/denuncias" @{ motivo = "Recomendação perigosa" } $t | Out-Null
        Write-Host "  denúncia registrada no post $($post4.id)"
    } catch {
        Write-Host "  denúncia não registrada ($(Status-Do-Erro $_))"
    }
}

Write-Host ""
Write-Host "Pronto. Logins de produtor: ana.ferreira@valence.dev, joao.batista@valence.dev e lucia.andrade@valence.dev"
