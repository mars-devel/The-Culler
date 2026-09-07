
const { ThreadChannel, ActionRowBuilder, Events, MediaGalleryBuilder, MediaGalleryItemBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize, ButtonBuilder, ButtonStyle, SectionBuilder, ContainerBuilder, MessageFlags } = require('discord.js');

const config = require("../config.json");

module.exports = {
    name: Events.ThreadCreate,

    /** @param {ThreadChannel} thread */
    async execute(thread) {
        const ownerid = thread.ownerId;
        const user = (await thread.client.users.fetch(ownerid)).username;
        const now = Date.now()
        const fiveMinsFromNow = Math.floor(now / 1000) + 5 * 60;
     
        

        const msg_component = new ContainerBuilder()
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
                new TextDisplayBuilder().setContent("By creating a thread, you acknowledge **you have read and understood the Wiki**. If that's not the case, DO NOT proceed."),
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
                new TextDisplayBuilder().setContent(`:warning: This thread is locked, and will be deleted on <t:${fiveMinsFromNow}:F> (<t:${fiveMinsFromNow}:R>), unless you click the button below.`),
            );

        const buttonid = now.toString();
        

        const cancel = new ButtonBuilder().setCustomId('cancel').setLabel('I HAVE read the wiki and I want to proceed.').setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder().addComponents(cancel);

        const sent = await thread.send({
            components: [msg_component, row],
            flags: MessageFlags.IsComponentsV2,
        });

        thread.setLocked(true, `Thread is held locked until ${user} (${ownerid}) acknowledges the wiki thingie.`)


        // TODO: Implement collector and deletion cancel logic properly.

        // const collector = sent.createMessageComponentCollector({ time: 5 * 60 * 1000 });

        // collector.on('collect', async interaction => {
        //     if (interaction.customId === 'confirm') {
        //         clearTimeout(deleteTimer); 
        //         await interaction.update({
        //             components: [msg_component],
        //         });
        //         collector.stop('confirmed');
        
        // collector.on('end', (collected, reason) => {
        //     // optionally disable buttons if not handled
        // });

        // /// thread.delete(`${user} (${ownerid}) is dumb`);



    }
}