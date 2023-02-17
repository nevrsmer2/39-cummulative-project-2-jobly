const { sqlForPartialUpdate } = require("../helpers/sql");

describe("Helper function sqlForPartialUpdate Tests", function () {
    const dataToUpdate = { firstName: 'Aliya', age: 32 };
    const jsToSql = {
        firstName: "first_name",
        lastName: "last_name",
        isAdmin: "is_admin",
    };
    test("It returns an object", function () {
        const result = sqlForPartialUpdate(dataToUpdate, jsToSql);
        expect(result instanceof Object).toBe(true);
    });
    test("It returns correct array of values and string of key:value pairs", function () {
        const result = sqlForPartialUpdate(dataToUpdate, jsToSql);
        expect(result.values).toEqual(['Aliya', 32]);
        expect(result.setCols).toEqual('"first_name"=$1, "age"=$2');
    });
});

