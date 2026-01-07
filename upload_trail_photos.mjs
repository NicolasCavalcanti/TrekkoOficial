import fs from 'fs';
import path from 'path';
import { storagePut } from './server/storage.js';

// Trail mapping based on the JSON results
const trailPhotos = {
  "Monte Roraima": [
    "0_ZGf8MyfwqeEWqwZMoQ55wn_1767821967056_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9Nb250ZSBSb3JhaW1hL3Bob3RvXzE.jpg",
    "0_ZGf8MyfwqeEWqwZMoQ55wn_1767821967056_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9Nb250ZSBSb3JhaW1hL3Bob3RvXzI.jpg",
    "0_ZGf8MyfwqeEWqwZMoQ55wn_1767821967056_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9Nb250ZSBSb3JhaW1hL3Bob3RvXzM.jpg",
    "0_ZGf8MyfwqeEWqwZMoQ55wn_1767821967056_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9Nb250ZSBSb3JhaW1hL3Bob3RvXzQ.jpg",
    "0_ZGf8MyfwqeEWqwZMoQ55wn_1767821967056_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9Nb250ZSBSb3JhaW1hL3Bob3RvXzU.jpg",
    "0_ZGf8MyfwqeEWqwZMoQ55wn_1767821967056_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9Nb250ZSBSb3JhaW1hL3Bob3RvXzY.jpg",
    "0_ZGf8MyfwqeEWqwZMoQ55wn_1767821967056_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9Nb250ZSBSb3JhaW1hL3Bob3RvXzc.jpg",
    "0_ZGf8MyfwqeEWqwZMoQ55wn_1767821967056_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9Nb250ZSBSb3JhaW1hL3Bob3RvXzg.jpg",
    "0_ZGf8MyfwqeEWqwZMoQ55wn_1767821967056_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9Nb250ZSBSb3JhaW1hL3Bob3RvXzk.jpg",
    "0_ZGf8MyfwqeEWqwZMoQ55wn_1767821967056_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9Nb250ZSBSb3JhaW1hL3Bob3RvXzEw.jpg"
  ],
  "Travessia Petrópolis x Teresópolis": [
    "1_WH9uSw7ikiK1SDfZrFQBiE_1767821948546_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9UcmF2ZXNzaWEgUGV0csOzcG9saXMgVGVyZXPDs3BvbGlzLzFvR1M1bHljZlRjNA.jpg",
    "1_WH9uSw7ikiK1SDfZrFQBiE_1767821948546_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9UcmF2ZXNzaWEgUGV0csOzcG9saXMgVGVyZXPDs3BvbGlzL01WV3hMQ1JyenBCSw.jpg",
    "1_WH9uSw7ikiK1SDfZrFQBiE_1767821948546_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9UcmF2ZXNzaWEgUGV0csOzcG9saXMgVGVyZXPDs3BvbGlzL05SMHhnTGdhZXRhbw.webp",
    "1_WH9uSw7ikiK1SDfZrFQBiE_1767821948546_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9UcmF2ZXNzaWEgUGV0csOzcG9saXMgVGVyZXPDs3BvbGlzL2FGczNJOURGTDVtdg.jpg",
    "1_WH9uSw7ikiK1SDfZrFQBiE_1767821948546_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9UcmF2ZXNzaWEgUGV0csOzcG9saXMgVGVyZXPDs3BvbGlzL2JjQ1d2VVpwcE9IMA.jpg",
    "1_WH9uSw7ikiK1SDfZrFQBiE_1767821948546_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9UcmF2ZXNzaWEgUGV0csOzcG9saXMgVGVyZXPDs3BvbGlzL2ZPeVh4ZUFFVmpJRA.jpg",
    "1_WH9uSw7ikiK1SDfZrFQBiE_1767821948546_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9UcmF2ZXNzaWEgUGV0csOzcG9saXMgVGVyZXPDs3BvbGlzL2ZZSEFUbERlYjdpMg.jpg",
    "1_WH9uSw7ikiK1SDfZrFQBiE_1767821948546_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9UcmF2ZXNzaWEgUGV0csOzcG9saXMgVGVyZXPDs3BvbGlzL2lXRnI5U2VvNHNxcw.jpeg",
    "1_WH9uSw7ikiK1SDfZrFQBiE_1767821948546_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9UcmF2ZXNzaWEgUGV0csOzcG9saXMgVGVyZXPDs3BvbGlzL2w4Rmw4b0lsOVdRMg.jpg",
    "1_WH9uSw7ikiK1SDfZrFQBiE_1767821948546_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9UcmF2ZXNzaWEgUGV0csOzcG9saXMgVGVyZXPDs3BvbGlzL3BIYnMwU1BlZ3NVcw.jpg"
  ],
  "Vale da Lua": [
    "2_zHLQkz86iTBYJ2uWgs2fev_1767822057600_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9WYWxlIGRhIEx1YSBDaGFwYWRhIGRvcyBWZWFkZWlyb3MvcGhvdG9fMQ.jpg",
    "2_zHLQkz86iTBYJ2uWgs2fev_1767822057600_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9WYWxlIGRhIEx1YSBDaGFwYWRhIGRvcyBWZWFkZWlyb3MvcGhvdG9fMg.jpg",
    "2_zHLQkz86iTBYJ2uWgs2fev_1767822057600_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9WYWxlIGRhIEx1YSBDaGFwYWRhIGRvcyBWZWFkZWlyb3MvcGhvdG9fMw.jpg",
    "2_zHLQkz86iTBYJ2uWgs2fev_1767822057600_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9WYWxlIGRhIEx1YSBDaGFwYWRhIGRvcyBWZWFkZWlyb3MvcGhvdG9fNA.jpg",
    "2_zHLQkz86iTBYJ2uWgs2fev_1767822057600_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9WYWxlIGRhIEx1YSBDaGFwYWRhIGRvcyBWZWFkZWlyb3MvcGhvdG9fNQ.jpg",
    "2_zHLQkz86iTBYJ2uWgs2fev_1767822057600_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9WYWxlIGRhIEx1YSBDaGFwYWRhIGRvcyBWZWFkZWlyb3MvcGhvdG9fNg.jpg",
    "2_zHLQkz86iTBYJ2uWgs2fev_1767822057600_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9WYWxlIGRhIEx1YSBDaGFwYWRhIGRvcyBWZWFkZWlyb3MvcGhvdG9fNw.jpg",
    "2_zHLQkz86iTBYJ2uWgs2fev_1767822057600_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9WYWxlIGRhIEx1YSBDaGFwYWRhIGRvcyBWZWFkZWlyb3MvcGhvdG9fOA.jpg",
    "2_zHLQkz86iTBYJ2uWgs2fev_1767822057600_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9WYWxlIGRhIEx1YSBDaGFwYWRhIGRvcyBWZWFkZWlyb3MvcGhvdG9fOQ.jpg",
    "2_zHLQkz86iTBYJ2uWgs2fev_1767822057600_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9WYWxlIGRhIEx1YSBDaGFwYWRhIGRvcyBWZWFkZWlyb3MvcGhvdG9fMTA.jpg"
  ],
  "Pedra do Baú": [
    "3_MklG0yLsuWyTvTbgMpY7nH_1767821938208_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9QZWRyYSBkbyBCYcO6L3Bob3RvXzE.jpg",
    "3_MklG0yLsuWyTvTbgMpY7nH_1767821938208_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9QZWRyYSBkbyBCYcO6L3Bob3RvXzI.jpg",
    "3_MklG0yLsuWyTvTbgMpY7nH_1767821938208_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9QZWRyYSBkbyBCYcO6L3Bob3RvXzM.jpg",
    "3_MklG0yLsuWyTvTbgMpY7nH_1767821938208_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9QZWRyYSBkbyBCYcO6L3Bob3RvXzQ.jpg",
    "3_MklG0yLsuWyTvTbgMpY7nH_1767821938208_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9QZWRyYSBkbyBCYcO6L3Bob3RvXzU.jpg",
    "3_MklG0yLsuWyTvTbgMpY7nH_1767821938208_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9QZWRyYSBkbyBCYcO6L3Bob3RvXzY.png",
    "3_MklG0yLsuWyTvTbgMpY7nH_1767821938208_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9QZWRyYSBkbyBCYcO6L3Bob3RvXzc.jpg",
    "3_MklG0yLsuWyTvTbgMpY7nH_1767821938208_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9QZWRyYSBkbyBCYcO6L3Bob3RvXzg.jpg",
    "3_MklG0yLsuWyTvTbgMpY7nH_1767821938208_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9QZWRyYSBkbyBCYcO6L3Bob3RvXzk.jpg",
    "3_MklG0yLsuWyTvTbgMpY7nH_1767821938208_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9QZWRyYSBkbyBCYcO6L3Bob3RvXzEw.jpg"
  ],
  "Pico da Bandeira": [
    "4_PaZ8AY4IHJAXZs4mMV3fMG_1767821942002_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9QaWNvIGRhIEJhbmRlaXJhL3Bob3RvXzE.jpg",
    "4_PaZ8AY4IHJAXZs4mMV3fMG_1767821942002_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9QaWNvIGRhIEJhbmRlaXJhL3Bob3RvXzI.jpg",
    "4_PaZ8AY4IHJAXZs4mMV3fMG_1767821942002_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9QaWNvIGRhIEJhbmRlaXJhL3Bob3RvXzM.jpg",
    "4_PaZ8AY4IHJAXZs4mMV3fMG_1767821942002_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9QaWNvIGRhIEJhbmRlaXJhL3Bob3RvXzQ.jpg",
    "4_PaZ8AY4IHJAXZs4mMV3fMG_1767821942002_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9QaWNvIGRhIEJhbmRlaXJhL3Bob3RvXzU.jpg",
    "4_PaZ8AY4IHJAXZs4mMV3fMG_1767821942002_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9QaWNvIGRhIEJhbmRlaXJhL3Bob3RvXzY.jpg",
    "4_PaZ8AY4IHJAXZs4mMV3fMG_1767821942002_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9QaWNvIGRhIEJhbmRlaXJhL3Bob3RvXzc.jpg",
    "4_PaZ8AY4IHJAXZs4mMV3fMG_1767821942002_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9QaWNvIGRhIEJhbmRlaXJhL3Bob3RvXzg.jpg",
    "4_PaZ8AY4IHJAXZs4mMV3fMG_1767821942002_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9QaWNvIGRhIEJhbmRlaXJhL3Bob3RvXzk.jpg",
    "4_PaZ8AY4IHJAXZs4mMV3fMG_1767821942002_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9QaWNvIGRhIEJhbmRlaXJhL3Bob3RvXzEw.jpg"
  ],
  "Cânion Itaimbezinho": [
    "5_ibPzTbhTJ0AaBkbAscswro_1767821945105_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9Dw6JuaW9uIEl0YWltYmV6aW5oby9waG90b18x.jpg",
    "5_ibPzTbhTJ0AaBkbAscswro_1767821945105_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9Dw6JuaW9uIEl0YWltYmV6aW5oby9waG90b18y.jpg",
    "5_ibPzTbhTJ0AaBkbAscswro_1767821945105_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9Dw6JuaW9uIEl0YWltYmV6aW5oby9waG90b18z.jpg",
    "5_ibPzTbhTJ0AaBkbAscswro_1767821945105_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9Dw6JuaW9uIEl0YWltYmV6aW5oby9waG90b180.jpg",
    "5_ibPzTbhTJ0AaBkbAscswro_1767821945105_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9Dw6JuaW9uIEl0YWltYmV6aW5oby9waG90b181.jpg",
    "5_ibPzTbhTJ0AaBkbAscswro_1767821945105_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9Dw6JuaW9uIEl0YWltYmV6aW5oby9waG90b182.jpg",
    "5_ibPzTbhTJ0AaBkbAscswro_1767821945105_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9Dw6JuaW9uIEl0YWltYmV6aW5oby9waG90b183.webp",
    "5_ibPzTbhTJ0AaBkbAscswro_1767821945105_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9Dw6JuaW9uIEl0YWltYmV6aW5oby9waG90b184.jpg",
    "5_ibPzTbhTJ0AaBkbAscswro_1767821945105_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9Dw6JuaW9uIEl0YWltYmV6aW5oby9waG90b185.jpg",
    "5_ibPzTbhTJ0AaBkbAscswro_1767821945105_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9Dw6JuaW9uIEl0YWltYmV6aW5oby9waG90b18xMA.jpg"
  ],
  "Trilha das 7 Praias": [
    "6_OP3RGOYBSffvzIsxLD911q_1767821937614_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9UcmlsaGEgZGFzIFByYWlhcyBVYmF0dWJhL3Bob3RvXzE.jpg",
    "6_OP3RGOYBSffvzIsxLD911q_1767821937614_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9UcmlsaGEgZGFzIFByYWlhcyBVYmF0dWJhL3Bob3RvXzI.jpg",
    "6_OP3RGOYBSffvzIsxLD911q_1767821937614_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9UcmlsaGEgZGFzIFByYWlhcyBVYmF0dWJhL3Bob3RvXzM.jpg",
    "6_OP3RGOYBSffvzIsxLD911q_1767821937614_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9UcmlsaGEgZGFzIFByYWlhcyBVYmF0dWJhL3Bob3RvXzQ.jpg",
    "6_OP3RGOYBSffvzIsxLD911q_1767821937614_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9UcmlsaGEgZGFzIFByYWlhcyBVYmF0dWJhL3Bob3RvXzU.jpg",
    "6_OP3RGOYBSffvzIsxLD911q_1767821937614_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9UcmlsaGEgZGFzIFByYWlhcyBVYmF0dWJhL3Bob3RvXzY.jpg",
    "6_OP3RGOYBSffvzIsxLD911q_1767821937614_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9UcmlsaGEgZGFzIFByYWlhcyBVYmF0dWJhL3Bob3RvXzc.jpg",
    "6_OP3RGOYBSffvzIsxLD911q_1767821937614_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9UcmlsaGEgZGFzIFByYWlhcyBVYmF0dWJhL3Bob3RvXzg.jpg",
    "6_OP3RGOYBSffvzIsxLD911q_1767821937614_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9UcmlsaGEgZGFzIFByYWlhcyBVYmF0dWJhL3Bob3RvXzk.jpg",
    "6_OP3RGOYBSffvzIsxLD911q_1767821937614_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9UcmlsaGEgZGFzIFByYWlhcyBVYmF0dWJhL3Bob3RvXzEw.jpg"
  ],
  "Travessia Serra Fina": [
    "7_vGPHdEuNi6m3TYKKzLdD5h_1767821937700_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9TZXJyYSBGaW5hL3Bob3RvXzE.jpg",
    "7_vGPHdEuNi6m3TYKKzLdD5h_1767821937700_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9TZXJyYSBGaW5hL3Bob3RvXzI.jpeg",
    "7_vGPHdEuNi6m3TYKKzLdD5h_1767821937700_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9TZXJyYSBGaW5hL3Bob3RvXzM.jpg",
    "7_vGPHdEuNi6m3TYKKzLdD5h_1767821937700_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9TZXJyYSBGaW5hL3Bob3RvXzQ.jpg",
    "7_vGPHdEuNi6m3TYKKzLdD5h_1767821937700_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9TZXJyYSBGaW5hL3Bob3RvXzU.webp",
    "7_vGPHdEuNi6m3TYKKzLdD5h_1767821937700_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9TZXJyYSBGaW5hL3Bob3RvXzY.jpg",
    "7_vGPHdEuNi6m3TYKKzLdD5h_1767821937700_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9TZXJyYSBGaW5hL3Bob3RvXzc.jpg",
    "7_vGPHdEuNi6m3TYKKzLdD5h_1767821937700_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9TZXJyYSBGaW5hL3Bob3RvXzg.jpeg",
    "7_vGPHdEuNi6m3TYKKzLdD5h_1767821937700_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9TZXJyYSBGaW5hL3Bob3RvXzk.jpg",
    "7_vGPHdEuNi6m3TYKKzLdD5h_1767821937700_na1fn_L2hvbWUvdWJ1bnR1L3RyYWlsX3Bob3Rvcy9TZXJyYSBGaW5hL3Bob3RvXzEw.jpg"
  ]
};

const galleryDir = '/home/ubuntu/trilhas-brasil/client/public/trails/gallery';

async function uploadTrailPhotos() {
  const results = {};
  
  for (const [trailName, photos] of Object.entries(trailPhotos)) {
    console.log(`\nUploading photos for: ${trailName}`);
    results[trailName] = [];
    
    for (let i = 0; i < photos.length; i++) {
      const filename = photos[i];
      const filepath = path.join(galleryDir, filename);
      
      try {
        const fileBuffer = fs.readFileSync(filepath);
        const ext = path.extname(filename).toLowerCase();
        const contentType = ext === '.png' ? 'image/png' : 
                           ext === '.webp' ? 'image/webp' : 
                           ext === '.jpeg' ? 'image/jpeg' : 'image/jpeg';
        
        // Create a clean key for S3
        const cleanTrailName = trailName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
        const s3Key = `trails/${cleanTrailName}/gallery-${i + 1}${ext}`;
        
        const { url } = await storagePut(s3Key, fileBuffer, contentType);
        results[trailName].push(url);
        console.log(`  [${i + 1}/10] Uploaded: ${s3Key}`);
      } catch (error) {
        console.error(`  [${i + 1}/10] Error uploading ${filename}:`, error.message);
      }
    }
  }
  
  // Output the results as JSON for database update
  console.log('\n\n=== UPLOAD RESULTS ===\n');
  console.log(JSON.stringify(results, null, 2));
  
  // Save to file
  fs.writeFileSync('/home/ubuntu/trail_gallery_urls.json', JSON.stringify(results, null, 2));
  console.log('\nSaved to /home/ubuntu/trail_gallery_urls.json');
}

uploadTrailPhotos().catch(console.error);
