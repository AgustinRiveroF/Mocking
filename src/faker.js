import { Faker, faker } from "@faker-js/faker";


export const generateProduct = () => {
    const product = {
        id: faker.database.mongodbObjectId,
        name: faker.commerce.product(),
        price: faker.commerce.price,
        category: faker.commerce.department(),
        stock: faker.number.int(),
    };
    return product;
};