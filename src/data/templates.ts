import { QCSTemplate } from "../types";

export const QCS_TEMPLATES: QCSTemplate[] = [
  {
    id: "orderflow-delta-suite",
    title: "Orderflow Delta Suite & CVD",
    category: "orderflow",
    difficulty: "Avançado",
    overlay: false,
    icon: "indicators:MACD",
    tags: ["Orderflow", "CVD", "Absorção", "Volume Delta", "Exaustão"],
    description:
      "Suite avançada de fluxo de ordens calculando Cumulative Volume Delta (CVD), desequilíbrios empilhados (imbalance), absorção institucional e exaustão de topos e fundos.",
    howToUse:
      "Acompanhe o histograma CVD: verde indica acúmulo comprador, vermelho distribuição vendedora. Sinais 'Abs' indicam absorção institucional perto de suportes/resistências e 'Stack' indica agressão direcional forte.",
    code: `instrument { name = "Orderflow Delta Suite", icon = "indicators:MACD", overlay = false }

-- ── Módulos ──
show_cvd = input(true, "Cumulative Volume Delta (CVD)", input.boolean)
show_imb = input(true, "Imbalance / absorption signals", input.boolean)

-- ── Cores ──
input_group {
    "Colors",
    col_up = input { default = rgba(0,200,150,1), type = input.color },
    col_dn = input { default = rgba(220,50,50,1), type = input.color }
}

-- ── CVD ──
input_group {
    "CVD",
    cvd_div_on = input(true, "Divergence detection", input.boolean),
    div_len = input(5, "Divergence pivot length", input.integer, 2, 20)
}

-- ── Imbalance ──
input_group {
    "Imbalance & Absorption",
    imb_thresh = input(0.6, "Imbalance threshold |delta|/volume", input.double, 0.1, 1.0),
    stack_len = input(3, "Stacked imbalance count", input.integer, 2, 10),
    abs_vol_mult = input(2.0, "Absorption volume multiplier", input.double, 1.0, 10.0),
    abs_rng_mult = input(0.5, "Absorption range x ATR(14)", input.double, 0.1, 5.0),
    piv_len = input(5, "Swing pivot length", input.integer, 2, 20)
}

-- ═══════════════════════════════════════════
-- DELTA APPROXIMATION (whole-bar)
-- ═══════════════════════════════════════════
local vol_safe
if na(volume) then
    vol_safe = 0
else
    vol_safe = volume
end

local bar_buy, bar_sell
if close > open then
    bar_buy = vol_safe
    bar_sell = 0
elseif close < open then
    bar_buy = 0
    bar_sell = vol_safe
else
    bar_buy = vol_safe * 0.5
    bar_sell = vol_safe * 0.5
end

bar_delta = bar_buy - bar_sell

-- ═══════════════════════════════════════════
-- MODULE 1 — CVD (Cumulative Volume Delta)
-- ═══════════════════════════════════════════
cvd = nz(cvd[1]) + bar_delta

rect { first = 0, second = cvd, color = iff(cvd >= 0, col_up, col_dn), width = 0.8 }
hline(0, "CVD zero", rgba(200,200,200,0.3), 1)

if show_cvd then
    plot(cvd, "CVD", iff(cvd >= nz(cvd[1]), col_up, col_dn), 2, 0, style.solid_line, na_mode.continue)
end

local bear_div = false
local bull_div = false
if show_cvd and cvd_div_on then
    bear_div = high > high[div_len] and cvd < cvd[div_len]
    bull_div = low < low[div_len] and cvd > cvd[div_len]
end

if show_cvd and cvd_div_on then
    plot_shape(bear_div, "Bear Div", shape_style.triangledown, shape_size.small, col_dn, shape_location.top, 0, "Div↓", col_dn)
    plot_shape(bull_div, "Bull Div", shape_style.triangleup, shape_size.small, col_up, shape_location.bottom, 0, "Div↑", col_up)
end

-- ═══════════════════════════════════════════
-- MODULE 2 — IMBALANCE & ABSORPTION
-- ═══════════════════════════════════════════
vol_sma = sma(vol_safe, 20)
atr_val = sma(tr, 14)

local delta_ratio
if vol_safe > 0 then
    delta_ratio = bar_delta / vol_safe
else
    delta_ratio = 0
end

local bull_imb = delta_ratio > imb_thresh
local bear_imb = delta_ratio < -imb_thresh

bull_run = iff(bull_imb, nz(bull_run[1]) + 1, 0)
bear_run = iff(bear_imb, nz(bear_run[1]) + 1, 0)

local bull_stack_sig = bull_run >= stack_len
local bear_stack_sig = bear_run >= stack_len

local high_vol = vol_safe > vol_sma * abs_vol_mult
local tight_range = (high - low) < atr_val * abs_rng_mult
swing_hi = highest(high, piv_len)
swing_lo = lowest(low, piv_len)
local near_hi = abs(high - swing_hi) <= atr_val
local near_lo = abs(low - swing_lo) <= atr_val

local abs_hi_sig = show_imb and high_vol and tight_range and near_hi
local abs_lo_sig = show_imb and high_vol and tight_range and near_lo

if show_imb then
    plot_shape(bull_stack_sig, "Bull Stack", shape_style.flag, shape_size.small, col_up, shape_location.bottom, 0, "Stack↑", col_up)
    plot_shape(bear_stack_sig, "Bear Stack", shape_style.flag, shape_size.small, col_dn, shape_location.top, 0, "Stack↓", col_dn)
    plot_shape(abs_hi_sig, "Abs High", shape_style.xcross, shape_size.small, col_dn, shape_location.top, 0, "Abs", col_dn)
    plot_shape(abs_lo_sig, "Abs Low", shape_style.xcross, shape_size.small, col_up, shape_location.bottom, 0, "Abs", col_up)
end

delta_ma = sma(bar_delta, 20)
plot(delta_ma, "Delta MA(20)", rgba(255,200,0,0.7), 1, 0, style.solid_line, na_mode.continue)`,
  },
  {
    id: "elder-impulse-system",
    title: "Elder Impulse System (Coloração de Velas)",
    category: "trend",
    difficulty: "Iniciante",
    overlay: true,
    icon: "indicators:MA",
    tags: ["Alexander Elder", "Coloração", "MACD", "EMA 13", "Overlay"],
    description:
      "Colorizador oficial de velas baseado no clássico sistema de Alexander Elder: Verde (impulso comprador), Vermelho (impulso vendedor) e Cinza (neutralidade/consolidação).",
    howToUse:
      "Opere CALL quando as velas mudarem de cinza para verde em tendência. Opere PUT quando mudarem para vermelho. Evite entradas durante sequências de velas neutras cinzas.",
    code: `instrument { name = "Elder Impulse System", icon = "indicators:MA", overlay = true }

input_group {
    "MACD",
    "Slow and fast EMA periods, used in MACD calculation",
    fast = input(12, "front.platform.fast period", input.integer, 1, 250),
    slow = input(26, "front.platform.slow period", input.integer, 1, 250)
}

input_group {
    "front.platform.signal-line",
    "Reference signal series period",
    signal_period = input(9, "front.period", input.integer, 1, 250)
}

input_group {
    "front.newind.emaperiod",
    ema_period = input(13, "front.period", input.integer, 1, 250)
}

input_group {
    "front.newind.barcolors",
    positive = input { default = "#2CAC40", type = input.color },
    neutral = input { default = "#C7CAD1", type = input.color },
    negative = input { default = "#DB4931", type = input.color }
}

fastMA = ema(close, fast)
slowMA = ema(close, slow)
macd = fastMA - slowMA
signal = sma(macd, signal_period)
hist = macd - signal

ema13 = ema(close, ema_period)

local bar_color
if ema13 > ema13[1] and hist > hist[1] then
    bar_color = positive
elseif ema13 < ema13[1] and hist < hist[1] then
    bar_color = negative
else
    bar_color = neutral
end

plot_candle(open, high, low, close, "ES", bar_color)`,
  },
  {
    id: "macd-cruzamento",
    title: "MACD Cruzamento & Histograma Bicolor",
    category: "oscillator",
    difficulty: "Iniciante",
    overlay: false,
    icon: "indicators:MACD",
    tags: ["MACD", "Histograma", "Cruzamento", "Subjanela"],
    description:
      "Indicador de painel separado completo com linhas MACD, Signal, Histograma de barras bicolores e setas nos cruzamentos de compra e venda.",
    howToUse:
      "Seta verde para cima indica cruzamento de alta da linha MACD sobre o sinal. Seta vermelha para baixo indica cruzamento de baixa. A cor do histograma indica aceleração do momentum.",
    code: `instrument { name = "MACD Cruzamento", icon = "indicators:MACD", overlay = false }

input_group {
    "MACD",
    fast_p = input(12, "EMA Rápida", input.integer, 1, 250),
    slow_p = input(26, "EMA Lenta", input.integer, 1, 250),
    signal_p = input(9, "Signal", input.integer, 1, 250)
}

input_group {
    "Cores",
    macd_cor = input { default = "#82aaff", type = input.color },
    signal_cor = input { default = "#ffcb6b", type = input.color },
    hist_up = input { default = "#2CAC40", type = input.color },
    hist_down = input { default = "#DB4931", type = input.color }
}

macd_line = ema(close, fast_p) - ema(close, slow_p)
signal_line = ema(macd_line, signal_p)
hist = macd_line - signal_line

buy_signal = crossover(macd_line, signal_line)
sell_signal = crossunder(macd_line, signal_line)

plot(macd_line, "MACD", macd_cor, 1)
plot(signal_line, "Signal", signal_cor, 1)
rect { first = 0, second = hist, color = iff(hist >= hist[1], hist_up, hist_down), width = 0.4 }
hline(0, "Zero", rgba(255, 255, 255, 0.15), 1)

plot_shape(buy_signal, "Compra", shape_style.triangleup, shape_size.small, "#2CAC40", shape_location.bottom, 0, "CALL", "#2CAC40")
plot_shape(sell_signal, "Venda", shape_style.triangledown, shape_size.small, "#DB4931", shape_location.top, 0, "PUT", "#DB4931")`,
  },
  {
    id: "rsi-reversao-extremos",
    title: "RSI 14 com Sinais de Reversão e Zonas Extremas",
    category: "oscillator",
    difficulty: "Iniciante",
    overlay: false,
    icon: "indicators:RSI",
    tags: ["RSI", "Sobrecompra", "Sobrevenda", "Reversão"],
    description:
      "RSI clássico de 14 períodos com linhas de referência 70/30/50 e disparos visuais quando o oscilador cruza de volta para dentro das zonas extremas.",
    howToUse:
      "Aguarde o RSI cair abaixo de 30 (sobrevenda) e cruzar para cima com vela de confirmação para CALL. Para PUT, aguarde subir acima de 70 (sobrecompra) e cruzar para baixo.",
    code: `instrument { name = "RSI Sinais Reversão", icon = "indicators:RSI", overlay = false }

input_group {
    "Parâmetros RSI",
    rsi_len = input(14, "Período do RSI", input.integer, 2, 100),
    ob_level = input(70, "Nível Sobrecompra", input.integer, 50, 95),
    os_level = input(30, "Nível Sobrevenda", input.integer, 5, 50)
}

input_group {
    "Cores",
    rsi_color = input { default = "#4fc3f7", type = input.color },
    call_color = input { default = "#00e676", type = input.color },
    put_color = input { default = "#ff1744", type = input.color }
}

rsi_val = rsi(close, rsi_len)

-- Cruzamento de retorno das zonas extremas
buy_sig = crossover(rsi_val, os_level)
sell_sig = crossunder(rsi_val, ob_level)

plot(rsi_val, "RSI", rsi_color, 2)
hline(ob_level, "Sobrecompra (70)", rgba(255, 50, 50, 0.4), 1)
hline(50, "Linha Central (50)", rgba(200, 200, 200, 0.2), 1)
hline(os_level, "Sobrevenda (30)", rgba(50, 200, 50, 0.4), 1)

plot_shape(buy_sig, "CALL", shape_style.triangleup, shape_size.small, call_color, shape_location.bottom, 0, "CALL", call_color)
plot_shape(sell_sig, "PUT", shape_style.triangledown, shape_size.small, put_color, shape_location.top, 0, "PUT", put_color)`,
  },
  {
    id: "ema-cross-trend-filter",
    title: "Cruzamento EMA 9/21 com Filtro de Tendência SMA 200",
    category: "trend",
    difficulty: "Iniciante",
    overlay: true,
    icon: "indicators:MA",
    tags: ["EMA", "Cruzamento", "Tendência", "SMA 200", "Overlay"],
    description:
      "Estratégia seguidora de tendência desenhada diretamente no gráfico principal: Médias de 9 e 21 períodos só emitem sinais a favor da tendência principal ditada pela SMA de 200.",
    howToUse:
      "CALL: EMA 9 cruza acima da EMA 21 enquanto o preço estiver acima da SMA 200. PUT: EMA 9 cruza abaixo da EMA 21 enquanto o preço estiver abaixo da SMA 200.",
    code: `instrument { name = "EMA 9/21 + Filtro 200", icon = "indicators:MA", overlay = true }

input_group {
    "Médias Móveis",
    fast_p = input(9, "EMA Rápida", input.integer, 1, 100),
    slow_p = input(21, "EMA Lenta", input.integer, 1, 200),
    trend_p = input(200, "SMA Tendência Macro", input.integer, 50, 500)
}

input_group {
    "Cores",
    c_fast = input { default = "#00e5ff", type = input.color },
    c_slow = input { default = "#ff9100", type = input.color },
    c_trend = input { default = "#ffffff", type = input.color }
}

ema_fast = ema(close, fast_p)
ema_slow = ema(close, slow_p)
sma_trend = sma(close, trend_p)

cross_up = crossover(ema_fast, ema_slow)
cross_dn = crossunder(ema_fast, ema_slow)

-- Filtro de tendência da média macro 200
call_signal = cross_up and close > sma_trend
put_signal = cross_dn and close < sma_trend

plot(ema_fast, "EMA Rápida", c_fast, 2)
plot(ema_slow, "EMA Lenta", c_slow, 2)
plot(sma_trend, "SMA 200 Macro", c_trend, 1)

plot_shape(call_signal, "CALL", shape_style.arrowup, shape_size.small, "#00e676", shape_location.belowbar, 0, "CALL", "#00e676")
plot_shape(put_signal, "PUT", shape_style.arrowdown, shape_size.small, "#ff1744", shape_location.abovebar, 0, "PUT", "#ff1744")`,
  },
  {
    id: "bollinger-bands-reversal",
    title: "Bandas de Bollinger com Preenchimento & Reversão",
    category: "volatility",
    difficulty: "Intermediário",
    overlay: true,
    icon: "indicators:BB",
    tags: ["Bollinger", "Volatilidade", "Reversão", "Fill"],
    description:
      "Bandas de Bollinger clássicas (20 períodos, 2 desvios padrão) com preenchimento sombreado e detecção de fechamento fora da banda com retorno.",
    howToUse:
      "CALL: Quando a vela anterior fechou abaixo da banda inferior e a vela atual fecha acima (rejeição de mínima). PUT: Quando a vela anterior fechou acima da banda superior e a vela atual fecha abaixo.",
    code: `instrument { name = "Bollinger Bands Reversão", icon = "indicators:BB", overlay = true }

input_group {
    "Bandas de Bollinger",
    bb_len = input(20, "Período da Média", input.integer, 5, 100),
    bb_mult = input(2.0, "Desvio Padrão", input.double, 0.5, 5.0)
}

input_group {
    "Cores",
    c_basis = input { default = "#ffea00", type = input.color },
    c_bands = input { default = "#2979ff", type = input.color }
}

basis = sma(close, bb_len)
dev = bb_mult * sma(tr, bb_len)

upper = basis + dev
lower = basis - dev

-- Reversão de toques extremos
bull_rev = close[1] < lower[1] and close > lower
bear_rev = close[1] > upper[1] and close < upper

p1 = plot(upper, "Banda Superior", c_bands, 1)
plot(basis, "Média Central", c_basis, 1)
p2 = plot(lower, "Banda Inferior", c_bands, 1)

fill(p1, p2, rgba(41, 121, 255, 0.08), "Canal Bollinger")

plot_shape(bull_rev, "CALL Reversão", shape_style.triangleup, shape_size.small, "#00e676", shape_location.belowbar, 0, "CALL", "#00e676")
plot_shape(bear_rev, "PUT Reversão", shape_style.triangledown, shape_size.small, "#ff1744", shape_location.abovebar, 0, "PUT", "#ff1744")`,
  },
  {
    id: "stochastic-signals",
    title: "Estocástico Rápido 14/3/3 com Sinais",
    category: "oscillator",
    difficulty: "Iniciante",
    overlay: false,
    icon: "indicators:Stoch",
    tags: ["Estocástico", "Oscilador", "Sobrecompra", "Sobrevenda"],
    description:
      "Oscilador Estocástico com cálculo das linhas %K e %D e filtros nos extremos 80/20.",
    howToUse:
      "CALL: Linha %K cruza acima da %D na zona de sobrevenda (< 20). PUT: Linha %K cruza abaixo da %D na zona de sobrecompra (> 80).",
    code: `instrument { name = "Estocástico Rápido", icon = "indicators:Stoch", overlay = false }

input_group {
    "Parâmetros Estocástico",
    k_period = input(14, "Período %K", input.integer, 1, 100),
    k_smooth = input(3, "Suavização %K", input.integer, 1, 20),
    d_period = input(3, "Período %D", input.integer, 1, 20)
}

input_group {
    "Cores e Níveis",
    c_k = input { default = "#00e5ff", type = input.color },
    c_d = input { default = "#ff4081", type = input.color },
    ob = input(80, "Sobrecompra", input.integer, 50, 95),
    os = input(20, "Sobrevenda", input.integer, 5, 50)
}

-- Cálculo do Estocástico
ll = lowest(low, k_period)
hh = highest(high, k_period)

local raw_k
if hh - ll > 0 then
    raw_k = 100 * (close - ll) / (hh - ll)
else
    raw_k = 50
end

k_line = sma(raw_k, k_smooth)
d_line = sma(k_line, d_period)

buy_sig = crossover(k_line, d_line) and k_line < os
sell_sig = crossunder(k_line, d_line) and k_line > ob

plot(k_line, "%K", c_k, 2)
plot(d_line, "%D", c_d, 1)

hline(ob, "Sobrecompra (80)", rgba(255, 50, 50, 0.3), 1)
hline(50, "Centro (50)", rgba(255, 255, 255, 0.15), 1)
hline(os, "Sobrevenda (20)", rgba(50, 255, 50, 0.3), 1)

plot_shape(buy_sig, "CALL", shape_style.triangleup, shape_size.small, "#00e676", shape_location.bottom, 0, "CALL", "#00e676")
plot_shape(sell_sig, "PUT", shape_style.triangledown, shape_size.small, "#ff1744", shape_location.top, 0, "PUT", "#ff1744")`,
  },
  {
    id: "pivot-support-resistance",
    title: "Suporte e Resistência Automático de Pivôs",
    category: "reversal",
    difficulty: "Intermediário",
    overlay: true,
    icon: "indicators:MA",
    tags: ["Price Action", "Suporte", "Resistência", "Pivôs", "Overlay"],
    description:
      "Linhas dinâmicas traçadas automaticamente nos topos e fundos dos últimos candles (Swing High e Swing Low), ideais para operações de retração e M1/M5.",
    howToUse:
      "Identifique zonas de rejeição. Quando o preço tocar a linha de suporte verde e deixar pavio de rejeição, busque CALL para a próxima vela. No toque da resistência vermelha com rejeição, busque PUT.",
    code: `instrument { name = "Suporte & Resistência Pivôs", icon = "indicators:MA", overlay = true }

input_group {
    "Pivôs",
    piv_period = input(10, "Período do Pivô", input.integer, 3, 50)
}

input_group {
    "Cores",
    c_res = input { default = "#ff1744", type = input.color },
    c_sup = input { default = "#00e676", type = input.color }
}

pivot_high = highest(high, piv_period)
pivot_low = lowest(low, piv_period)

plot(pivot_high, "Resistência (Topo)", c_res, 2)
plot(pivot_low, "Suporte (Fundo)", c_sup, 2)

-- Alerta de rompimento ou teste
test_sup = low <= pivot_low[1] and close > pivot_low[1]
test_res = high >= pivot_high[1] and close < pivot_high[1]

plot_shape(test_sup, "Toque Suporte", shape_style.diamond, shape_size.tiny, c_sup, shape_location.belowbar)
plot_shape(test_res, "Toque Resistência", shape_style.diamond, shape_size.tiny, c_res, shape_location.abovebar)`,
  },
];
