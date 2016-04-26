# -*- coding: utf-8 -*-
"""
Created on Wed Aug 12 14:22:48 2015

@author: Luke
"""



#==============================================================================
# config = {"db":"LINCS_L1000_LJP2015",
#           "coll":"CD",
#           "index":"l1000-2",
#           "dataType":"level5",
#           "suggestType":"suggest"}
#==============================================================================
          
config = {"db":"L1000_POL",
          "coll":"cd",
          "esHosts":"http://146.203.54.71/es/",
          "sniff_on_start":True,
          "index":"pol",
          "dataType":"level5",
          "suggestType":"suggest"}

from pymongo import MongoClient
client = MongoClient('azu', 27017)
db = client[config['db']]
coll = db[config['coll']]

import requests
import json

i = 1
terms = set()
ids = set()
for doc in coll.find(filter=None,projection={'_id':False,'chdirLm':False,'chdirFull':False,'sigIdx':False}):
    doc.pop('_id',None)
    esDoc = {}
    esDoc['time'] = str(doc['pert_time'])+doc['pert_time_unit']
    terms.add(esDoc['time'])
    esDoc['cell'] = doc['cell_id']
    terms.add(esDoc['cell'])
    esDoc['batch'] = doc['batch']
    terms.add(esDoc['batch'])
    esDoc['group'] = doc['batch'].split('_')[0]
    terms.add(esDoc['group'])
    esDoc['dose'] = str(doc['pert_dose'])+doc['pert_dose_unit']
    terms.add(esDoc['dose'])
    esDoc['pert'] = doc['pert_iname']
    terms.add(esDoc['pert'])
    esDoc['pert_id'] = doc['pert_id']
    ids.add(esDoc['pert_id'])
    ids.add(doc['sig_id'])
    esDoc['sig_id'] = doc['sig_id']
    if "pvalue" in doc:
        esDoc['pvalue'] = doc['pvalue']
    r = requests.put(config['esHosts']+config['index']+'/'+config['dataType']+'/'+str(i),json.dumps(esDoc))
    if i%100 == 0:
        print(i)    
    i = i+1

import json
level34 = json.load(open('level34suggest.json','r'))
terms = terms.union(set(level34['terms']))
ids = ids.union(set(level34['ids']))


    
i = 1
for term in terms:
    requests.put(config['esHosts']+config['index']+'/'+config['suggestType']+'/'+str(i),json.dumps({'name':term}))
#    es.index(index=config['index'],doc_type=config['suggestType'],id=i,body={'name':term})
    i = i+1

for ID in ids:
    requests.put(config['esHosts']+config['index']+'/'+config['suggestType']+'/'+str(i),json.dumps({'id':ID}))
#    es.index(index=config['index'],doc_type=config['suggestType'],id=i,body={'id':ID})
    i = i+1