// User types and interfaces converted to JSDoc comments for better IDE support

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {string} name
 * @property {'admin'|'guard'|'resident'} role
 * @property {string} createdAt
 * @property {string} [uniqueId] - For guards and residents
 * @property {string} [apartmentNumber] - For residents
 * @property {string} [shiftSchedule] - For guards
 */

/**
 * @typedef {Object} AuthContextType
 * @property {User|null} user
 * @property {function(string, string): Promise<boolean>} login
 * @property {function(): void} logout
 * @property {boolean} isLoading
 */

/**
 * @typedef {Object} LoginCredentials
 * @property {string} email
 * @property {string} password
 */

/**
 * @typedef {Object} Guard
 * @property {string} id
 * @property {string} uniqueId
 * @property {string} name
 * @property {string} email
 * @property {string} shiftSchedule
 * @property {string} createdAt
 */

/**
 * @typedef {Object} Resident
 * @property {string} id
 * @property {string} uniqueId
 * @property {string} name
 * @property {string} email
 * @property {string} apartmentNumber
 * @property {string} createdAt
 */

/**
 * @typedef {Object} VisitorInvite
 * @property {string} id
 * @property {string} residentId
 * @property {string} visitorName
 * @property {string} visitorPhone
 * @property {string} visitDate
 * @property {string} visitTime
 * @property {string} purpose
 * @property {string} code
 * @property {'pending'|'approved'|'expired'} status
 * @property {string} createdAt
 */

export {};