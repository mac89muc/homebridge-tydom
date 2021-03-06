import {EventEmitter} from 'events';
import Hap, {Accessory, Categories, Service} from 'hap-nodejs';
import {TydomConfigGroup, TydomMetaElement} from './tydom';

export interface HomebridgeApi extends EventEmitter {
  // _accessories: Record<string, unknown>;
  // _platforms: Record<string, unknown>;
  // _configurableAccessories: Record<string, unknown>;
  // _dynamicPlatforms: Record<string, unknown>;
  version: number;
  serverVersion: string;
  user: unknown;
  hapLegacyTypes: Record<string, number | string>;
  hap: typeof Hap;
  platformAccessory: typeof PlatformAccessory;
  updatePlatformAccessories: (accessories: PlatformAccessory[]) => void;
  registerPlatformAccessories: (pluginName: string, platformName: string, accessories: PlatformAccessory[]) => void;
  unregisterPlatformAccessories: (pluginName: string, platformName: string, accessories: PlatformAccessory[]) => void;
  // _events: Record<string, unknown>;
  // _eventsCount: number;
}

export interface Platform {
  disabled: boolean;
  configureAccessory: (accessory: PlatformAccessory) => void;
  api: HomebridgeApi;
  // config: null | Record<string, any>;
  // accessories: () => Promise<unknown[]>;
}

export type TydomAccessoryContext = {
  name: string;
  category: Categories;
  metadata: TydomMetaElement[];
  settings: Record<string, unknown>;
  deviceId: number;
  endpointId: number;
  accessoryId: string;
  manufacturer: string;
  serialNumber: string;
  group?: TydomConfigGroup;
  model: string;
};

export type TydomAccessoryUpdateContext = Pick<
  TydomAccessoryContext,
  'category' | 'deviceId' | 'endpointId' | 'accessoryId'
>;

declare class PlatformAccessory extends EventEmitter {
  UUID: string;
  displayName: string;
  context: TydomAccessoryContext;
  category: Categories;
  _associatedHAPAccessory: Accessory;
  constructor(displayName: string, UUID: string, category?: Categories);
  addService(service: Service | typeof Service, ...constructorArgs: any[]): Service;
  getService(service: Service | typeof Service): Service;
  removeService(service: Service | typeof Service): void;
  getServiceByUUIDAndSubType(service: typeof Service, subtype?: string): Service | undefined;
}

export {PlatformAccessory};
