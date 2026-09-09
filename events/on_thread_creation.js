const { ThreadChannel, ActionRowBuilder, Events, MediaGalleryBuilder, MediaGalleryItemBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize, ButtonBuilder, ButtonStyle, SectionBuilder, ContainerBuilder, MessageFlags, ComponentType, ChannelType, GuildMember, Role } = require('discord.js');

const config = require("../config.json");

module.exports = {
    name: Events.ThreadCreate,

    /** @param {ThreadChannel} thread */
    async execute(thread) {

        const thread_owner_id = thread.ownerId;
        const thread_owner_user = await thread.guild.members.fetch(thread_owner_id);
        const thread_owner_name = thread_owner_user.displayName;

        // Checks if the Thread originates from a MODERATED FORUM channel.
        if (thread.parent.type != ChannelType.GuildForum) return;
        if (thread.parent.id != config.moderated_forum_channels) return;

        if (thread_owner_user.roles.cache.hasAny(...config.roles.override_thread_verification)) return;

        const now = Date.now();
        const in_5mins = Math.floor(now / 1000) + 5 * 60;
        
        // TODO: The messages on this component generator are provisional. We'll need to change them.
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
                    new TextDisplayBuilder().setContent(`**You have created a thread, <@${thread_owner_id}>**`),
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
                                .setURL("https://ctl.stanford.edu/students/fundamentals-efficient-reading")
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

        const new_thread_msg = thread_message("By creating a thread, you acknowledge **you have read and understood the Wiki**. If that's not the case, DO NOT proceed.", `:warning: This thread is locked, and will be deleted on <t:${in_5mins}:F> (<t:${in_5mins}:R>), unless you click the button below.`);

        const button_id = thread_owner_id + "." + now.toString() + ".ihaveread_confirm";

        // console.debug(button_id)
        // console.debug(button_id.length)


        // Confirmation Button
        const reading_confirmation_button = new ButtonBuilder().setCustomId(button_id).setLabel('I HAVE read the wiki and I want to proceed.').setStyle(ButtonStyle.Secondary);
        const reading_confirmation_row = new ActionRowBuilder().addComponents(reading_confirmation_button);

        // Sends the first message.
        const message = await thread.send({
            components: [new_thread_msg, reading_confirmation_row],
            flags: MessageFlags.IsComponentsV2,
        });

        thread.setLocked(true, `Thread is held locked until ${thread_owner_name} (${thread_owner_id}) acknowledges the wiki thingie.`)

        // Button interaction collector section

        const collector = message.createMessageComponentCollector({
            time: 5 * 60 * 1000,
            componentType: ComponentType.Button
        });

        collector.on('collect', async interaction => {
            if (interaction.customId == button_id) {
                collector.stop('OK');
            }
        })

        collector.on('end', async (collected, reason) => {

            // console.debug(`Collected ${collected.size} interactions.`);
            if (reason == "OK") {
                thread.setLocked(false);
                const ok_thread_msg = thread_message("You acknowledge **you have read and understood the Wiki**. If that's not the case, DO NOT proceed.", `Please, use your brain... :pleading_face:`)
                message.edit(
                    { components: [ok_thread_msg], flags: MessageFlags.IsComponentsV2 | MessageFlags.Urgent }
                )
                return;
            }
            await thread.delete(`${thread_owner_name} (${thread_owner_user}) is dumb`);
            // console.debug(`Thread ${thread.name} has been deleted.`)
        });

    }
}

