
import employeeService from "./services/employee.service";
import fabricatorService from "./services/fabricator.service";
import rfqService from "./services/rfq.service";

class Service1 { }

const services: any[] =[
    employeeService,
    fabricatorService,
    rfqService
]

services.forEach(service => {
  Object.getOwnPropertyNames(service).forEach(prop => {
    if (prop !== 'prototype' && prop !== 'name' && prop !== 'length') {
      (Service1 as any)[prop] = (...args: any[]) => service[prop](...args)
    }
  })
})

export {
employeeService,
fabricatorService,
rfqService
}

export default Service1