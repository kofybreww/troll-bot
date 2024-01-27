import { Message } from 'discord.js';
import { client } from '../TrollClient';
import { TrollCommand } from '../TrollCommand';
import { UserData } from '../models/User';

export const WithdrawCommand = new TrollCommand(client, {
  name: 'withdraw',
  aliases: [],
  description: 'withdraw money from the bank',
  arguments: [{ name: 'Amount', type: 'NUMBER', required: true }],
  async run(message: Message, args: [number]) {
    const user = await UserData.findOne({ id: message.author.id });

    // A few checks before proceeding: The user must specify how much 
    // money, and have said money in their vault
    if (!user.vault || user.vault === 0) {
      message.channel.send('there\'s no money in your bank');// use currency later
      return;
    } else if (args[0] <= 0) {
      message.channel.send('you really think you\'re a funny guy huh');
      return
    } else if (!args[0]) {
      message.channel.send('you gotta say how much');
      return;
    } else if (user.vault < args[0]) {
      message.channel.send('you cant withdraw more than what you have');
      return;
    }

    // Amount of money in the vault
    let current = user.vault;

    // Multiply the amount given based on the amount of days
    let daysSince = Math.floor(Math.abs((user.lastVaulted - Date.now())  / (1000 * 3600 * 24)));
    let multiplier = 1 + (daysSince / 10);
    let earnings = Math.floor(args[0] * multiplier);
    
    // Update the user in the database and send the message
    await UserData.findOneAndUpdate(
      { id: message.author.id }, 
      { $set: { 
          vault: current - args[0],
          lastVaulted: Date.now(),
          balance: user.balance + earnings
        } 
      }
    );

    message.channel.send(`here's your **${earnings}** coins, straight from the bank 👍 \nyou now have **${current - args[0]}** coins in the vault`);
  }
});