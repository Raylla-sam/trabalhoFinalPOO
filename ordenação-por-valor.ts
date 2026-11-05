import type { Carta } from "../modelos/carta";
import type { EstrategiaDeOrdenacao } from "../contratos/estrategia-de-ordenacao";

export class OrdenacaoPorValor implements EstrategiaDeOrdenacao {

  ordenar(cartas: Carta[]): Carta[] {
    const cartasOrdenadas = [...cartas];

    cartasOrdenadas.sort((carta1, carta2) => {
      return carta1.comparar(carta2);
    });

    return cartasOrdenadas;
  }

}
import { OrdenacaoPorValor } from "./implementacoes/ordenacao-por-valor";
import { PilhaEmArray } from "./implementacoes/pilha-em-array";
import { FilaEmArray } from "./implementacoes/fila-em-array";
import { GeradorCongruencial } from "./implementacoes/gerador-congruencial";
import { FormatadorCompacto } from "./implementacoes/formatador-compacto"
import { Baralho } from "./modelos/baralho";
import { Jogador } from "./modelos/jogador";
import { Partida } from "./partida/partida";
import { Verificador } from "./verificacao/verificador";
import { MesaGrafica } from "./ui/mesa";
import { lerSemente, ligarControlesDeSemente } from "./ui/semente";
import type { PilhaDeCartas } from "./contratos/pilha-de-cartas";
import type { FilaDeJogadores } from "./contratos/fila-de-jogadores";
import type { GeradorAleatorio } from "./contratos/gerador-aleatorio";
import type { EstrategiaDeOrdenacao } from "./contratos/estrategia-de-ordenacao";
import type { FormatadorDeCarta } from "./contratos/formatador-de-carta";

// A semente da partida vem da página (?semente=123); o padrão é 42.
// O verificador usa sempre a semente 42, pois conhece a sequência dela.
const SEMENTE = lerSemente();
const SEMENTE_DE_TESTE = 42;

const gerador: GeradorAleatorio = new GeradorCongruencial(SEMENTE);
const geradorDeTeste: GeradorAleatorio = new GeradorCongruencial(SEMENTE_DE_TESTE);

const compra: PilhaDeCartas = new PilhaEmArray();
const descarte: PilhaDeCartas = new PilhaEmArray();

const ordemDaVez: FilaDeJogadores = new FilaEmArray();

const ordenacao: EstrategiaDeOrdenacao = new OrdenacaoPorValor();

const formatador: FormatadorDeCarta = new FormatadorCompacto();
console.log("=== Verificação das implementações ===");
const verificador = new Verificador(
  formatador, compra, ordemDaVez, ordenacao, geradorDeTeste,
);
for (const linha of verificador.executar()) {
  if (linha.startsWith("[ERRO]")) {
    console.error(linha);
  } else {
    console.log(linha);
  }
}

mostrarPagina();

function mostrarPagina(): void {
  const semente = document.getElementById("semente");
  if (semente !== null) {
    semente.textContent = `· semente ${SEMENTE}`;
  }
  ligarControlesDeSemente(SEMENTE);

  if (!verificador.todasPassaram()) {
    const aviso = document.getElementById("aviso");
    if (aviso !== null) {
      aviso.hidden = false;
      aviso.textContent =
        "Alguma implementação não passou na verificação. " +
        "Abra o console do navegador (F12) e corrija os itens marcados com [ERRO].";
    }
    return;
  }

  // Etapa 2: a partida só conhece os contratos (as interfaces).
  const baralho = new Baralho();
  baralho.embaralhar(gerador);
  baralho.empilharEm(compra);

  const jogadores: Jogador[] = [
    new Jogador("Ana", 15),
    new Jogador("Bruno", 17),
    new Jogador("Carla", 18),
    new Jogador("Diego", 16),
  ];

  const partida = new Partida(jogadores, compra, descarte, ordemDaVez, ordenacao);
  const resultado = partida.jogar();

  const mesa = document.getElementById("mesa");
  if (mesa !== null) {
    mesa.hidden = false;
  }
  new MesaGrafica(resultado, formatador).iniciar();
}
