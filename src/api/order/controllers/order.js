'use strict';

const stripe = require("stripe")("sk_test_51N60nfBto3cA7tFN3QgOKVCJu4a5Ewk18sMIREI0RjoLy1UeqGvDromfRNjt0fesjUJa5FiZ2NnAjiRg2Z6cQMjj00CRC6Dskg")
//CLAVE SECRETA en la linea 3 sacada de la pagina de stripe con mi cuenta alex.liza....
/**
 * order controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController("api::order.order",({ strapi }) => ({
    async paymentOrder(ctx) {
        const { token, products, idUser, appointmentData} = ctx.request.body;

        let totalPayment = 0;

        products.forEach((product) => {

            totalPayment += Number(product.attributes.price) * product.quantity;
        });

        const charge = await stripe.charges.create({
            amount: Math.round(totalPayment * 100),
            currency: "eur",
            source: token.id,
            description: `User ID: ${idUser}`,
        });

        const data = {
            products,
            user: idUser,
            totalPayment,
            idPayment: charge.id,
            appointmentData,
        };

        const model = strapi.contentTypes["api::order.order"];
        const validData = await strapi.entityValidator.validateEntityCreation(
            model,
            data
        );

        const entry = await strapi.db
            .query("api::order.order")
            .create({ data: validData });

        return entry;
    },
}));
