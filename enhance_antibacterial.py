import json, shutil, zipfile, subprocess, os
from datetime import date
root='/mnt/data/continue12'
p=root+'/data/drugs.json'
data=json.load(open(p,encoding='utf-8')); drugs=data['drugs']
by={x['generic_name_zh']:x for x in drugs}
updates={
'阿莫西林':('犬、猫','敏感细菌感染','口服/注射','11–30 mg/kg，PO/SC/IV，q8–24h','MSD Veterinary Manual—Penicillins','β-内酰胺；具体制剂仍以批准标签为准。'),
'阿莫西林克拉维酸钾':('犬、猫','敏感细菌感染，皮肤软组织感染等','口服','犬 12.5–25 mg/kg PO q12h；猫 10–20 mg/kg PO q8h','MSD Veterinary Manual—Penicillins','参考剂量；不能替代具体中国制剂说明书。'),
'头孢氨苄':('犬、猫','皮肤/软组织等敏感细菌感染','口服','猫 15–35 mg/kg PO q6–12h；犬 15–45 mg/kg PO q6–12h','MSD Veterinary Manual—Cephalosporins','需结合感染部位与药敏。'),
'头孢唑林':('犬、猫','敏感细菌感染；围手术期预防等','IM/SC/IV','15–35 mg/kg IM/SC/IV q6–8h','MSD Veterinary Manual—Cephalosporins','围手术期给药需结合手术类型与院感方案。'),
'头孢泊肟':('犬、猫','敏感细菌感染','口服','5–10 mg/kg PO q12–24h','MSD Veterinary Manual—Cephalosporins','MSD列示的犬猫参考范围；具体产品标签优先。'),
'头孢噻呋':('牛、猪等批准物种','敏感细菌感染','按具体制剂','需按批准物种和具体制剂标签；MSD对犬软组织感染不推荐常规外推','MSD Veterinary Manual—Cephalosporins','食品动物严格按批准标签与休药期，不跨物种套用。'),
'阿米卡星':('犬、猫','敏感需氧革兰阴性菌等','IM/IV/SC','猫 10–15 mg/kg q24h；犬 15–30 mg/kg q24h','MSD Veterinary Manual—Aminoglycosides','肾毒性风险；应结合肾功能及必要的血药浓度监测。'),
'庆大霉素':('犬、猫','敏感需氧细菌感染','IM/IV/SC','犬 10–14 mg/kg q24h；猫 5–8 mg/kg q24h','MSD Veterinary Manual—Aminoglycosides','肾功能受损需减量/调整；存在肾毒性风险。'),
'恩诺沙星':('犬、猫','敏感细菌感染','PO/注射','犬常用参考 5 mg/kg PO q24h；危重病例需依据感染部位、药敏与PK/PD调整','MSD Veterinary Manual—Antistaphylococcal antimicrobials','猫尤其注意视网膜毒性风险；氟喹诺酮类应强调药敏与抗菌药物管理。'),
'马波沙星':('犬、猫','敏感细菌感染','口服','2.75–5.5 mg/kg PO q24h','MSD Veterinary Manual—Quinolones','应依据药敏及感染部位选择；避免不必要的高等级抗菌药使用。'),
'多西环素':('犬、猫','立克次体/支原体/衣原体、媒介传播病原等','口服','5–10 mg/kg PO q24h；特定心丝虫方案可 10 mg/kg PO q12h ×30d','MSD Veterinary Manual—Tetracyclines','猫固体制剂给药后应饮水或随食，以降低食管损伤风险。'),
'氯霉素':('犬、猫等特定物种','敏感细菌感染','口服','50 mg/kg PO q8h','MSD Veterinary Manual—Antistaphylococcal antimicrobials','骨髓抑制及人畜共患职业暴露风险需纳入处方决策；具体法规与物种限制必须核对。'),
'克林霉素':('犬、猫','皮肤软组织、口腔/牙源性、骨感染等敏感感染','口服','犬 10–20 mg/kg PO q12h；猫 12.5–25 mg/kg PO q12h','MSD Veterinary Manual—Antistaphylococcal antimicrobials','猫口服给药需注意食管损伤风险；耐药应依据培养药敏。'),
'林可霉素':('犬、猫等','敏感细菌感染','口服','10–20 mg/kg PO q12h','MSD Veterinary Manual—Antistaphylococcal antimicrobials','按感染部位和药敏调整疗程。'),
'阿奇霉素':('犬、猫','特定敏感细菌/支原体等感染','口服','10 mg/kg PO q24h，常见参考 5–7d','MSD Veterinary Manual—Antistaphylococcal antimicrobials','不应把通用参考剂量当作所有适应证的固定疗程。'),
'利福平':('犬、猫等','特定敏感细菌感染，常作为联合方案组成部分','口服','5–10 mg/kg PO q12–24h','MSD Veterinary Manual—Antistaphylococcal antimicrobials','药物相互作用显著，肝功能与联合用药需监测。'),
'磺胺甲噁唑':('犬、猫','敏感细菌感染；若与甲氧苄啶组成复方则按复方剂量','口服','单药不建议直接套用复方TMP-sulfa剂量；复方犬 30–45 mg/kg PO q12h、猫 15 mg/kg PO q12h（按总组合量）','MSD Veterinary Manual—Sulfonamides','慢性使用需关注角膜结膜干燥、骨髓抑制等不良反应；复方比例必须确认。'),
'甲硝唑':('犬、猫','厌氧菌感染、贾第虫等','口服/静脉','本批次暂不写固定剂量；优先按具体适应证、制剂标签与最新指南核验','MSD Veterinary Manual—Antimicrobial principles','高剂量/长期使用存在神经毒性风险；不要把单一经验剂量用于所有胃肠疾病。'),
'多黏菌素B':('按具体批准物种/制剂','敏感革兰阴性菌等特定感染','按制剂','本批次不填跨物种系统剂量','MSD Veterinary Manual—Antimicrobial principles','肾毒性/神经毒性与耐药管理重要；应严格依据具体制剂和药敏。'),
}
source_map={
'MSD Veterinary Manual—Penicillins':'https://www.msdvetmanual.com/pharmacology/antibacterial-agents/beta-lactam-antimicrobial-use-in-animals',
'MSD Veterinary Manual—Cephalosporins':'https://www.msdvetmanual.com/pharmacology/antibacterial-agents/cephalosporins-and-cephamycins-use-in-animals',
'MSD Veterinary Manual—Aminoglycosides':'https://www.msdvetmanual.com/pharmacology/antibacterial-agents/aminoglycosides-use-in-animals',
'MSD Veterinary Manual—Quinolones':'https://www.msdvetmanual.com/pharmacology/antibacterial-agents/quinolones-including-fluoroquinolones-for-use-in-animals',
'MSD Veterinary Manual—Tetracyclines':'https://www.msdvetmanual.com/pharmacology/antibacterial-agents/tetracyclines-use-in-animals',
'MSD Veterinary Manual—Antistaphylococcal antimicrobials':'https://www.msdvetmanual.com/multimedia/table/dosages-of-antistaphylococcal-antimicrobials',
'MSD Veterinary Manual—Sulfonamides':'https://www.msdvetmanual.com/pharmacology/antibacterial-agents/sulfonamides-and-sulfonamide-combinations-use-in-animals',
'MSD Veterinary Manual—Antimicrobial principles':'https://www.msdvetmanual.com/pharmacology/antibacterial-agents/design-of-dosing-regimens-for-animals',
}
count=0
for n,(species,ind,route,dose,src,note) in updates.items():
    x=by.get(n)
    if not x: continue
    lc=x.setdefault('label_card',{})
    du=lc.setdefault('dose_use',{})
    du.update({'species':species,'indication':ind,'route':route,'dose':dose,'basis':'B级｜权威兽医资料','notes':note})
    ev=lc.setdefault('evidence',{})
    ev.update({'label_status':'权威兽医资料参考','review_status':'B级｜已补充权威资料','last_verified':'2026-09-02','sources':[src], 'source_urls':[source_map.get(src)]})
    lc['monitoring']=lc.get('monitoring') or []
    if '按具体制剂核对官方标签/说明书' not in ' '.join(lc['monitoring']): lc['monitoring'].append('本条目为B级兽医资料参考；开具处方前仍需核对具体产品官方标签、批准文号、物种、适应证、规格及法规要求。')
    count+=1
# version metadata
if 'policy' in data: data['policy']['evidence_policy']='A级官方标签优先；B级权威兽医资料不得伪装为中国具体产品标签。'
data['last_reviewed']='2026-09-02'
open(p,'w',encoding='utf-8').write(json.dumps(data,ensure_ascii=False,indent=2))
print('enhanced',count)
