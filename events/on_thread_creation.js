const { ThreadChannel, ActionRowBuilder, Events, MediaGalleryBuilder, MediaGalleryItemBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize, ButtonBuilder, ButtonStyle, SectionBuilder, ContainerBuilder, MessageFlags, ComponentType } = require('discord.js');

const config = require("../config.json");

module.exports = {
    name: Events.ThreadCreate,

    /** @param {ThreadChannel} thread */
    async execute(thread) {
        const ownerid = thread.ownerId;
        const user = (await thread.client.users.fetch(ownerid)).username;
        const now = Date.now()
        const fiveMinsFromNow = Math.floor(now / 1000) + 5 * 60;

        function thread_message(description, footer) {
            return new ContainerBuilder()
                .setAccentColor(31352)
                .addMediaGalleryComponents(
                    new MediaGalleryBuilder()
                        .addItems(
                            new MediaGalleryItemBuilder()
                                .setURL("https://testimages.org/img/testimages_screenshot.jpg").setDescription("test"),
                        ),
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`**You have created a thread, <@${ownerid}>**`),
                )
                .addSeparatorComponents(
                    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(description),
                )
                .addSectionComponents(
                    new SectionBuilder()
                        .setButtonAccessory(
                            new ButtonBuilder()
                                .setStyle(ButtonStyle.Link)
                                .setLabel("Read The Wiki NOW")
                                .setEmoji({
                                    name: "📖",
                                })
                                .setURL("https://microsoftaccountrecovery.miraheze.org/wiki/Main_Page")
                        )
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent("* If you haven't read the Wiki yet"),
                        ),
                )
                .addSectionComponents(
                    new SectionBuilder()
                        .setButtonAccessory(
                            new ButtonBuilder()
                                .setStyle(ButtonStyle.Link)
                                .setLabel("See This")
                                .setURL("https://google.com")
                        )
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent("* If you don't know how to read yet"),
                        ),
                )
                .addSeparatorComponents(
                    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(footer),
                );

        }

        const new_thread_msg = thread_message("By creating a thread, you acknowledge **you have read and understood the Wiki**. If that's not the case, DO NOT proceed.", `:warning: This thread is locked, and will be deleted on <t:${fiveMinsFromNow}:F> (<t:${fiveMinsFromNow}:R>), unless you click the button below.`)

        const buttonid = ownerid + "." + now.toString() + ".ihaveread_confirm";

        // console.debug(buttonid)
        // console.debug(buttonid.length)

        const ihaveread = new ButtonBuilder().setCustomId(buttonid).setLabel('I HAVE read the wiki and I want to proceed.').setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder().addComponents(ihaveread);

        const message = await thread.send({
            components: [new_thread_msg, row],
            flags: MessageFlags.IsComponentsV2,
        });

        thread.setLocked(true, `Thread is held locked until ${user} (${ownerid}) acknowledges the wiki thingie.`)

        const collector = message.createMessageComponentCollector({
            time: 5 * 60 * 1000,
            componentType: ComponentType.Button
        });

        collector.on('collect', async interaction => {
            if (interaction.customId == buttonid) {
                collector.stop('OK');
            }
        })

        collector.on('end', async (collected, reason) => {
            console.log(`Collected ${collected.size} interactions.`);
            if (reason == "OK") {

                const ok_thread_msg = thread_message("You acknowledge **you have read and understood the Wiki**. If that's not the case, DO NOT proceed.", `Please, use your brain... :pleading_face:`)

                message.edit(
                    { components: [ok_thread_msg], flags: MessageFlags.IsComponentsV2 | MessageFlags.Urgent }
                )
                return;
            }
            await thread.delete(`${user} (${ownerid}) is dumb`);
            console.debug(`Thread ${thread.name} has been deleted.`)
        });

    }
}
