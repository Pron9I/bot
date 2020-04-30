// const SocksAgent = require('C:/Users/GOD/ATIBOT/node_modules/socks5-https-client/lib/Agent.js');

// const socksAgent = new SocksAgent({
//     socksHost: '188.241.45.61',
//     socksPort: 4145,
//     //   // socksUsername: ,
//     //   // socksPassword: ,
// });
require('dotenv').config();

const Telegraf = require('telegraf');

// const Extra = require('telegraf/extra');

const Markup = require('telegraf/markup');

const bot = new Telegraf(
    process.env.BOT_TOKEN
    // , { telegram: { agent: socksAgent } }
);

async function ATIparse(cityLoad, radLoad) {
    const Nightmare = require('nightmare');
    // show: true,
    const nightmare = Nightmare({
        typeInterval: 500,
    });
    let finish = {};
    nightmare
        .goto('https://loads.ati.su/')
        .insert('#weightTo', 11)
        .insert('#volumeTo', 45)
        .check('#extraParam2')
        .check('#extraParam10')
        .check('#extraParam4')
        .check('#extraParam12')
        .check('#loadingTypeFav1')
        .check('#truckTypeFav0')
        .check('#truckTypeFav1')
        .check('#truckTypeFav3')
        .check('#truckTypeFav4')
        .check('#truckTypeFav0')
        .type('#from', cityLoad)
        .evaluate(() => {
            return document.querySelectorAll('.dropdown-menu li')[0].querySelector('.ng-binding')
                .innerText;
        })
        .then((id) => {
            // && !id.includes('обл')
            if (!id.includes('регион') && !id.includes('край')) {
                return nightmare
                    .evaluate(() => {
                        return document.querySelectorAll('.dropdown-menu li')[0].id;
                    })
                    .then((id) => {
                        return nightmare
                            .click(`#${id}`)
                            .insert('#fromRadius', radLoad)
                            .click(`.search-form-button`);
                    });
            }
            return nightmare
                .evaluate(() => {
                    return document.querySelectorAll('.dropdown-menu li')[1].querySelector('.ng-binding')
                        .innerText;
                })
                .then((id) => {
                    if (!id.includes('регион') && !id.includes('край')) {
                        return nightmare
                            .evaluate(() => {
                                return document.querySelectorAll('.dropdown-menu li')[1].id;
                            })
                            .then((id) => {
                                return nightmare
                                    .click(`#${id}`)
                                    .insert('#fromRadius', radLoad)
                                    .click(`.search-form-button`);
                            });
                    }
                    return nightmare
                        .evaluate(() => {
                            return document.querySelectorAll('.dropdown-menu li')[2].querySelector('.ng-binding')
                                .innerText;
                        })
                        .then((id) => {
                            if (!id.includes('регион') && !id.includes('край')) {
                                return nightmare
                                    .evaluate(() => {
                                        return document.querySelectorAll('.dropdown-menu li')[1].id;
                                    })
                                    .then((id) => {
                                        return nightmare
                                            .click(`#${id}`)
                                            .insert('#fromRadius', radLoad)
                                            .click(`.search-form-button`);
                                    });
                            }
                        });
                });
        })
        .then(() => {
            return nightmare
                .wait(1500)
                .evaluate(() => {
                    return document.querySelector('.grid-row').querySelector('.load-date-cell span b')
                        .innerText;
                })
                .then((text) => {
                    finish.time = text;
                })
                .catch(() => {
                    console.log('Время не указано');
                    finish.time = 'не указано';
                });
        })
        .then(() => {
            return nightmare
                .wait(1500)
                .evaluate(() => {
                    return document
                        .querySelector('.grid-row')
                        .querySelector('div[data-bo-if="e.rate.priceNoNds > 0"] span')
                        .innerText;
                })
                .then((noNds) => {
                    finish.noNds = noNds;
                })
                .catch(() => {
                    console.log('Без ндс не указано');
                    finish.noNds = 'не указано';
                });
        })
        .then(() => {
            return nightmare
                .evaluate(() => {
                    return document
                        .querySelector('.grid-row')
                        .querySelector('div[data-bo-if="e.rate.price > 0"] .rate-bold').innerText;
                })
                .then((cash) => {
                    finish.cash = cash;
                })
                .catch(() => {
                    console.log('Нал не указан');
                    finish.cash = 'не указан';
                });
        })
        .then(() => {
            return nightmare
                .evaluate(() => {
                    return document
                        .querySelector('.grid-row')
                        .querySelector('span[data-bo-text="e.unloading.location.city"]').innerText;
                })
                .then((unloadCity) => {
                    finish.unloadCity = unloadCity;
                })
                .catch(() => {
                    console.log('Выгрузка не указана');
                    finish.unloadCity = 'не указан';
                });
        })
        .then(() => {
            return nightmare
                .evaluate(() => {
                    return document
                        .querySelector('.grid-row')
                        .querySelector('span[data-bo-text="e.loading.location.city"]').innerText;
                })
                .then((loadCity) => {
                    finish.loadCity = loadCity;
                })
                .catch(() => {
                    console.log('Загрузка не указана');
                    finish.loadCity = 'не указан';
                });
        })
        .then(() => {
            return nightmare
                .evaluate(() => {
                    return document
                        .querySelector('.grid-row')
                        .querySelector('a[data-bo-href="e.route.distanceLink"]').innerText;
                })
                .then((distance) => {
                    finish.distance = distance;
                })
                .catch(() => {
                    console.log('Расстояние не указано');
                    finish.distance = 'не указано';
                });
        })
        .then(() => {
            return nightmare
                .evaluate(() => {
                    return document.querySelector('.grid-row').querySelector('.loading-dates').innerText;
                })
                .then((loadDate) => {
                    finish.loadDate = loadDate;
                })
                .catch(() => {
                    console.log('Дата загрузки не указана');
                    finish.loadDate = 'не указана';
                });
        })
        .then(() => {
            return nightmare.end();
        })
        .catch(function (error) {
            console.error('Search failed:', error);
        });
    return finish;
}
let isEnough = false;
let parsing;
bot.hears('Закончить поиск', (ctx) => {
    isEnough = true;
    ctx.reply('Поиск завершен. Для дальнешего использования введи: "[ГОРОД] [РАССТОЯНИЕ]"');
});

bot
    .start((ctx) =>
        ctx.reply(
            `Привет, ${ctx.message.from.first_name}! Для начала поиска груза напиши: "[ГОРОД] [РАССТОЯНИЕ]"`
        )
    )
    .on('text', (ctx) => {
        const data = ctx.message.text.split(' ');
        isEnough = false;
        let time;
        let newReq = {};
        time = 'начало';
        parsing = async function () {
            newReq = await ATIparse(data[0], data[1]);
            setTimeout(() => {
                if (newReq.time != time || time === 'начало') {
                    ctx.reply(
                        `Город загрузки: ${newReq.loadCity}\nГород выгрузки: ${newReq.unloadCity}\nРасстояние: ${newReq.distance}\nДата загрузки: ${newReq.loadDate}\nНал: ${newReq.cash}\nБез НДС: ${newReq.noNds}`,
                        Markup.keyboard(['Закончить поиск']).oneTime().resize().extra()
                    );
                    time = newReq.time;
                }
            }, 20000)
        };
        if (!isEnough) parsing();
    });

bot.on('sticker', (ctx) => ctx.reply('👍'));

bot.launch();

// bot
//     .start((ctx) =>
//         ctx.reply(
//             `Привет, ${ctx.message.from.first_name}! Для начала поиска груза напиши: "[ГОРОД] [РАССТОЯНИЕ]"`
//         )
//     )
//     .on('text', (ctx) => {
//         const data = ctx.message.text.split(' ');
//         let time;
//         let newReq = {};
//         time = 'начало';
//         parsing = setInterval(() => {
//             newReq = ATIparse(data[0], data[1]);
//             setTimeout(() => {
//                 if (newReq.time != time || time === 'начало') {
//                     ctx.reply(
//                         `Город загрузки: ${newReq.loadCity}\nГород выгрузки: ${newReq.unloadCity}\nРасстояние: ${newReq.distance}\nДата загрузки: ${newReq.loadDate}\nНал: ${newReq.cash}\nБез НДС: ${newReq.noNds}`,
//                         Markup.keyboard(['Закончить поиск']).oneTime().resize().extra()
//                     );
//                     time = newReq.time;
//                 }
//             }, 20000);
//         }, 45000);
//     });