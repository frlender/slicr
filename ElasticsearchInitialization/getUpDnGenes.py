# -*- coding: utf-8 -*-
"""
Created on Tue Apr 26 10:39:41 2016

@author: Luke
"""

config = {"db":"L1000_POL", "coll":"cd"}


from pymongo import MongoClient
client = MongoClient('azu', 27017)
db = client[config['db']]
coll = db[config['coll']]

import json
with open('../data/POLgenes.json','r') as pf:
    polGenes = json.load(pf)

for doc in coll.find():  
    if 'sigIdx' in doc and len(doc['sigIdx'])>=5:
        upGenes = []
        dnGenes = []  
        for idx in doc['sigIdx']:
            zeroBasedIdx = idx-1
            gene = polGenes[zeroBasedIdx]
            if doc['chdirFull'][zeroBasedIdx] > 0:
                upGenes.append(gene)
            else:
                dnGenes.append(gene)
        coll.update({'sig_id':doc['sig_id']},{'$set':{'upGenes':upGenes,
                    'dnGenes':dnGenes}})