/* 苏州房产成交跟踪数据 —— 家庭看板读取源
 * 自动再生：gen_suzhou_property.py 读「苏州楼市周报台账.md」重建 weekly[]
 * 口径：weekly 为周报住宅口径(全市六区)；daily 为公众号单日播报。两者口径不同，勿混算。
 */
window.SUZHOU_PROPERTY = {
  "updated_at": "2026-10-28 23:05",
  "note": "weekly=网易楼市周报(住宅/全市口径，含环比同比)；daily=苏州楼市公众号单日播报。两套口径不同，去化周期基于单日新房估算，仅供参考。",
  "daily": {
    "date": "2026-10-12",
    "total": 386,
    "new_home": 135,
    "second_hand": 251,
    "new_supply": 0,
    "inventory": 43048
  },
  "dailyHistory": [
    {
      "date": "2026-10-12",
      "total": 386,
      "new_home": 135,
      "second_hand": 251
    }
  ],
  "weekly": [
    {
      "week": "第41周(10/05-10/11)",
      "new_home": 264.0,
      "new_qoq": -7.04,
      "new_yoy": -5.04,
      "new_avg": 38.0,
      "new_area": 3.61,
      "second_hand": 601.0,
      "second_qoq": -21.54,
      "second_yoy": 24.69,
      "second_avg": 86.0,
      "second_area": 6.7,
      "source": "网易楼市周报"
    },
    {
      "week": "第42周(10/12-10/18)",
      "new_home": 558.0,
      "new_qoq": 111.36,
      "new_yoy": 16.74,
      "new_avg": 80.0,
      "new_area": 7.81,
      "second_hand": 1352.0,
      "second_qoq": 124.96,
      "second_yoy": 45.53,
      "second_avg": 194.0,
      "second_area": 14.52,
      "source": "网易楼市周报"
    }
  ]
};
