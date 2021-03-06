import {AccessoryEventTypes, Categories, Characteristic, Service, VoidCallback} from 'hap-nodejs';
import {setupFan, updateFan} from 'src/accessories/fan';
import {setupGarageDoorOpener} from 'src/accessories/garageDoorOpener';
import {setupLightbulb, updateLightbulb} from 'src/accessories/lightbulb';
import {setupSecuritySystem, updateSecuritySystem} from 'src/accessories/securitySystem';
import {setupSecuritySystemSensors, updateSecuritySystemSensors} from 'src/accessories/securitySystemSensors';
import {setupTemperatureSensor, updateTemperatureSensor} from 'src/accessories/temperatureSensor';
import {setupThermostat, updateThermostat} from 'src/accessories/thermostat';
import {updateWindowCovering, setupWindowCovering} from 'src/accessories/windowCovering';
import TydomController from 'src/controller';
import {PlatformAccessory, TydomAccessoryContext} from 'src/typings/homebridge';
import assert from 'src/utils/assert';
import debug from 'src/utils/debug';
import {setupContactSensor, updateContactSensor} from 'src/accessories/contactSensor';

export const SECURITY_SYSTEM_SENSORS = parseInt(`${Categories.SECURITY_SYSTEM}0`);

export const asNumber = (maybeNumber: unknown) => parseInt(`${maybeNumber}`, 10);

export const getAccessoryService = (accessory: PlatformAccessory, ServiceClass: typeof Service): Service => {
  const service = accessory.getService(ServiceClass);
  assert(service, `Unexpected missing service "${ServiceClass.name}" in accessory`);
  return service;
};

export const getAccessoryServiceWithSubtype = (
  accessory: PlatformAccessory,
  ServiceClass: typeof Service,
  subtype: string
): Service => {
  const service = accessory.getServiceByUUIDAndSubType(ServiceClass, subtype);
  assert(service, `Unexpected missing service "${ServiceClass.name}" with subtype="${subtype}" in accessory`);
  return service;
};

export const addAccessoryService = (
  accessory: PlatformAccessory,
  service: Service | typeof Service,
  name: string,
  removeExisting: boolean = false
) => {
  const existingService = accessory.getService(service);
  if (existingService) {
    if (!removeExisting) {
      return existingService;
    }
    accessory.removeService(existingService);
  }
  return accessory.addService(service, name);
};

export const addAccessoryServiceWithSubtype = (
  accessory: PlatformAccessory,
  service: typeof Service,
  name: string,
  subtype: string,
  removeExisting: boolean = false
) => {
  const existingService = accessory.getServiceByUUIDAndSubType(service, subtype);
  if (existingService) {
    if (!removeExisting) {
      return existingService;
    }
    accessory.removeService(existingService);
  }
  return accessory.addService(service, name, subtype);
};

type TydomAccessorySetup = (accessory: PlatformAccessory, controller: TydomController) => void | Promise<void>;

export const getTydomAccessorySetup = (accessory: PlatformAccessory): TydomAccessorySetup => {
  const {category} = accessory;
  switch (category) {
    case Categories.LIGHTBULB:
      return setupLightbulb;
    case Categories.THERMOSTAT:
      return setupThermostat;
    case Categories.FAN:
      return setupFan;
    case Categories.GARAGE_DOOR_OPENER:
      return setupGarageDoorOpener;
    case Categories.WINDOW_COVERING:
      return setupWindowCovering;
    case Categories.SECURITY_SYSTEM:
      return setupSecuritySystem;
    case Categories.SENSOR:
      return setupTemperatureSensor;
    case Categories.WINDOW:
    case Categories.DOOR:
      return setupContactSensor;
    case SECURITY_SYSTEM_SENSORS:
      return setupSecuritySystemSensors;
    default:
      throw new Error(`Unsupported accessory category=${category}`);
  }
};

export type TydomAccessoryUpdateType = 'data' | 'cdata';

type TydomAccessoryUpdate = (
  accessory: PlatformAccessory,
  controller: TydomController,
  updates: Record<string, unknown>[],
  type: TydomAccessoryUpdateType
) => void | Promise<void>;

export const getTydomAccessoryDataUpdate = (accessory: PlatformAccessory): TydomAccessoryUpdate => {
  const {category} = accessory;
  switch (category) {
    case Categories.LIGHTBULB:
      return updateLightbulb;
    case Categories.THERMOSTAT:
      return updateThermostat;
    case Categories.FAN:
      return updateFan;
    case Categories.GARAGE_DOOR_OPENER:
      return () => {
        // no-op
      };
    case Categories.WINDOW_COVERING:
      return updateWindowCovering;
    case Categories.SECURITY_SYSTEM:
      return updateSecuritySystem;
    case Categories.SENSOR:
      return updateTemperatureSensor;
    case Categories.WINDOW:
    case Categories.DOOR:
      return updateContactSensor;
    case SECURITY_SYSTEM_SENSORS:
      return updateSecuritySystemSensors;
    default:
      throw new Error(`Unsupported accessory category=${category}`);
  }
};

export const setupAccessoryInformationService = (accessory: PlatformAccessory, _controller: TydomController): void => {
  const {context} = accessory;
  const {manufacturer, serialNumber, model} = context as TydomAccessoryContext;

  const informationService = accessory.getService(Service.AccessoryInformation);
  assert(informationService, `Did not found AccessoryInformation service`);
  informationService
    .setCharacteristic(Characteristic.Manufacturer, manufacturer)
    .setCharacteristic(Characteristic.SerialNumber, serialNumber)
    .setCharacteristic(Characteristic.Model, model);
};

export const setupAccessoryIdentifyHandler = (accessory: PlatformAccessory, _controller: TydomController): void => {
  const {displayName: name, UUID: id} = accessory;
  // listen for the "identify" event for this Accessory
  accessory.on(AccessoryEventTypes.IDENTIFY, async (paired: boolean, callback: VoidCallback) => {
    debug({id, type: 'AccessoryEventTypes.IDENTIFY', paired});
    debug(`New identify request for device named="${name}" with id="${id}"`);
    callback();
  });
};

export const assignTydomContext = (
  prev: PlatformAccessory['context'],
  next: TydomAccessoryContext
): prev is TydomAccessoryContext => {
  Object.assign(prev, next);
  return true;
};
