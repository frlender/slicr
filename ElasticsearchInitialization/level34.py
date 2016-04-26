# -*- coding: utf-8 -*-
"""
Created on Wed Aug 12 14:22:48 2015

@author: Luke
"""

import json
import requests

#==============================================================================
# config = {"db":"LINCS_L1000_LJP2015",
#           "coll":"data",
#           "index":"l1000-2",
#           "dataType":"leve34",
#           "suggestType":"suggest"}
#==============================================================================

config = {"db":"L1000_POL",
          "coll":"inst",
          "esHosts":"http://146.203.54.71/es/",
          "sniff_on_start":True,
          "index":"pol",
          "dataType":"level34",
          "suggestType":"suggest"}


from pymongo import MongoClient
client = MongoClient('azu', 27017)
db = client[config['db']]
coll = db[config['coll']]



with open('mapping.json','r') as mf:
    mapping = json.load(mf)

requests.delete(config['esHosts']+config['index'])
r = requests.put(config['esHosts']+config['index'],json.dumps(mapping))
print(r.json())

i = 1
terms = set()
ids = set()
for doc in coll.find(filter=None,projection={'_id':False}):
    doc.pop('_id',None)
    doc.pop('vector',None)
    esDoc = {}
    esDoc['time'] = str(doc['pert_time'])+doc['pert_time_unit']
    terms.add(esDoc['time'])
    esDoc['cell'] = doc['cell_id']
    terms.add(esDoc['cell'])
    esDoc['batch'] = doc['batch']
    terms.add(esDoc['batch'])
    esDoc['group'] = doc['batch'].split('_')[0]
    terms.add(esDoc['group'])
    if doc['pert_type'] == 'ctl_vehicle':
        esDoc['pert'] = 'control'
        terms.add(esDoc['pert'])
    else:
        esDoc['dose'] = str(doc['pert_dose'])+doc['pert_dose_unit']
        terms.add(esDoc['dose'])
        esDoc['pert'] = doc['pert_iname']
        terms.add(esDoc['pert'])
        esDoc['pert_id'] = doc['pert_id']
        ids.add(esDoc['pert_id'])
    ids.add(doc['distil_id'])
    esDoc['distil_id'] = doc['distil_id']
    r = requests.put(config['esHosts']+config['index']+'/'+config['dataType']+'/'+str(i),json.dumps(esDoc))
    if i%100 == 0:
        print(i)
    i = i+1

import json
level34 = {'terms':list(terms),'ids':list(ids)}
json.dump(level34,open('level34suggest.json','w'))
    
#==============================================================================
# i = 1
# for term in terms:
#     es.index(index=config['index'],doc_type=config['suggestType'],id=i,body={'name':term})
#     i = i+1
# 
# for ID in ids:
#     es.index(index=config['index'],doc_type=config['suggestType'],id=i,body={'id':ID})
#==============================================================================