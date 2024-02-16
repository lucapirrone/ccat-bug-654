import * as fs from "fs";
import csv from 'csv-parser';

export interface CveRecord {
    dataType: string
    dataVersion: string
    cveMetadata: CveMetadata
    containers: Containers
  }
  
  export interface CveMetadata {
    cveId: string
    assignerOrgId: string
    state: string
    assignerShortName: string
    dateReserved: string
    datePublished: string
    dateUpdated: string
  }
  
  export interface Containers {
    cna: Cna
  }
  
  export interface Cna {
    affected: Affected[]
    credits: Credit[]
    datePublic: string
    descriptions: Description[]
    providerMetadata: ProviderMetadata
    references: Reference[]
    source: Source
    title: string
    x_generator: XGenerator
  }
  
  export interface Affected {
    defaultStatus: string
    modules: string[]
    product: string
    vendor: string
    versions: Version[]
  }
  
  export interface Version {
    lessThan: string
    status: string
    version: string
    versionType: string
  }
  
  export interface Credit {
    lang: string
    type: string
    user: string
    value: string
  }
  
  export interface Description {
    lang: string
    value: string
  }
  
  export interface ProviderMetadata {
    orgId: string
    shortName: string
    dateUpdated: string
  }
  
  export interface Reference {
    tags: string[]
    url: string
  }
  
  export interface Source {
    discovery: string
  }
  
  export interface XGenerator {
    engine: string
  }
