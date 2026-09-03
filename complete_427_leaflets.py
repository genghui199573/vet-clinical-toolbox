import json, copy, re, os
base='/mnt/data/all/data'
drugs=json.load(open(base+'/drugs.json',encoding='utf-8'))['drugs']
leaf=json.load(open(base+'/drug_leaflets_5.0.json',encoding='utf-8'))
old={x['drug_id']:x for x in leaf['drugs']}

def txt(v, default):
    if v is None or v=='' or v==[]: return default
    return v

def section_from_card(card, oldx):
    ls=copy.deepcopy(oldx.get('label_sections',{}))
    for k in ['indications','dose_use','contraindications','warnings','adverse_reactions','interactions','special_populations','monitoring','withdrawal_period','storage','expiry','approval_number','manufacturer']:
        if k in card and card[k] not in (None,'',[]): ls[k]=copy.deepcopy(card[k])
    # Explicitly represent missing data rather than nulls.
    defaults={
      'contraindications':['当前数据库未完成具体制剂标签核验；不得据此推定绝对禁忌。'],
      'warnings':['当前数据库未完成具体制剂标签核验；使用前核对物种、制剂、肝肾功能及合并用药。'],
      'adverse_reactions':['当前数据库未完成具体制剂标签核验；按具体产品说明书及已知药理风险监测。'],
      'interactions':['当前数据库未完成系统性相互作用核验；处方前检查联合用药。'],
      'special_populations':['妊娠、哺乳、幼龄、老龄及肝肾功能异常动物需依据具体药品资料个体化评估。'],
      'withdrawal_period':'未核验；食品动物必须核对具体批准产品休药期。',
      'storage':'未核验；按具体产品标签储存。',
      'expiry':'未核验；按具体产品包装/标签。',
      'approval_number':'未核验（药物索引条目，不等同于具体商品）。',
      'manufacturer':'未核验（药物索引条目，不等同于具体商品）。'
    }
    for k,v in defaults.items():
        if ls.get(k) in (None,'',[]): ls[k]=v
    return ls

out=[]
for d in drugs:
    oid=d['id']; ox=old.get(oid,{})
    card=copy.deepcopy(d.get('label_card',{}))
    pi=copy.deepcopy(ox.get('product_identity',{}))
    basic=card.get('basic',{})
    for src,dst in [('generic_name_zh','generic_name_zh'),('generic_name_en','generic_name_en'),('aliases','aliases'),('brands','brands'),('active_ingredient','active_ingredient'),('class','class'),('forms','forms'),('species','species')]:
        if basic.get(src) not in (None,'',[]): pi[dst]=basic[src]
    pi.setdefault('generic_name_zh',d.get('generic_name_zh'))
    pi.setdefault('generic_name_en',d.get('generic_name_en') or None)
    pi.setdefault('aliases',d.get('aliases',[])); pi.setdefault('brands',d.get('brand_names',[]))
    pi.setdefault('active_ingredient',d.get('active_ingredient')); pi.setdefault('class',d.get('pharmacologic_class'))
    pi.setdefault('forms',d.get('dosage_forms',[])); pi.setdefault('species',d.get('species_groups',[]))
    ls=section_from_card(card,ox)
    ev=copy.deepcopy(ox.get('evidence',{}))
    ce=copy.deepcopy(card.get('evidence',{}))
    # Prefer the stronger, already-curated evidence metadata when present.
    for k in ['label_status','review_status','last_verified','sources','source_urls']:
        if ce.get(k) not in (None,'',[]):
            ev[k if k!='label_status' else 'status']=ce[k]
    if 'status' not in ev: ev['status']=d.get('records',[{}])[0].get('label_status','待核验')
    if 'review_status' not in ev: ev['review_status']=d.get('review_status','待核验')
    if 'last_verified' not in ev: ev['last_verified']=d.get('last_verified')
    ev.setdefault('sources',d.get('records',[{}])[0].get('source_ids',[]))
    ev.setdefault('source_urls',[])
    ev['notes']='结构化资料库条目。A级仅用于已核验具体产品官方资料；B级为权威兽医资料参考；C/D级不应作为具体商品批准标签或固定处方。所有具体制剂仍需核对当前官方标签、批准文号、物种、规格及法规要求。'
    missing=[k for k,v in ls.items() if v in (None,'',[]) and k not in ('indications','dose_use','monitoring')]
    ev['missing_fields']=missing
    # Score based on substantive fields, while penalizing explicit unverified placeholders.
    substantive=['indications','dose_use','contraindications','warnings','adverse_reactions','interactions','special_populations','monitoring','withdrawal_period','storage','expiry','approval_number','manufacturer']
    score=sum(1 for k in substantive if ls.get(k) not in (None,'',[]))/len(substantive)
    if any('未核验' in str(ls.get(k)) or '当前数据库未完成' in str(ls.get(k)) for k in substantive): score=min(score,0.70)
    ev['completeness_score']=round(score,2)
    out.append({'schema_version':'5.0','drug_id':oid,'product_identity':pi,'label_sections':ls,'evidence':ev})
leaf['drugs']=out
leaf['last_reviewed']='2026-09-03'
leaf['enhancement_summary']={
 'total_drugs':len(out),
 'purpose':'一次性完成427条药物结构化说明书资料卡；缺失信息以待核验状态明确标记，不编造具体商品标签。',
 'sync_source':'data/drugs.json label_card + data/drug_leaflets_5.0.json',
 'version':'5.0-r08'
}
json.dump(leaf,open(base+'/drug_leaflets_5.0.json','w',encoding='utf-8'),ensure_ascii=False,indent=2)
print('updated',len(out))
