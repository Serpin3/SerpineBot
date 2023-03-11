import { Skeleton, Text } from '@mantine/core';
import { Client, Collection, GatewayIntentBits } from 'discord.js';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import Image from 'next/image';
import { useEffect, useState } from 'react';

import Details from '../components/details';
import styles from '../styles/Home.module.css';
import type { Command } from '../types/response';

interface Props {
	commands: Command[];
}

const Accordion = dynamic(() => import('../components/accordion'), { loading: () => <div>Loading...</div> });

export const getStaticProps = async () => {
	const client = new Client({ intents: [GatewayIntentBits.Guilds] });
	await client.login(process.env.BOT_TOKEN);

	const commands = ((await client.application?.commands.fetch()) ?? new Collection())
		.map((command) => command.toJSON() as Command)
		.map(({ name, description, options, defaultMemberPermissions }) => ({
			name,
			description,
			options: options.sort((a, b) => a.name.localeCompare(b.name)),
			defaultMemberPermissions,
		}))
		.sort((a, b) => a.name.localeCompare(b.name));

	const serializedCommands = JSON.parse(
		JSON.stringify(commands, (_key, value) => {
			if (typeof value === 'undefined') return null;
			if (typeof value === 'bigint') return value.toString();
			return value;
		}),
	);

	return { props: { commands: serializedCommands }, revalidate: 60 * 60 * 24 };
};

const Home = ({ commands }: Props) => {
	const [loading, setLoading] = useState(true);

	useEffect(() => setLoading(false), []);

	return (
		<div className={styles.container}>
			<Head>
				<title>SerpineBot Documentation</title>
				<meta name="author" content="Luís Ferro" />
				<meta name="description" content="Overview of all SerpineBot commands" />
				<meta name="keywords" content="serpinebot,bot,discordjs,multipurpose"></meta>
				<meta httpEquiv="Content-Type" content="text/html; charset=utf-8"></meta>
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<main className={styles.main}>
				<Skeleton visible={loading} className={styles.skeleton}>
					<Details
						title="SerpineBot, a multipurpose discord bot for my private discord server"
						description={`This page is an overview of all available slash commands.<br/>
						Does not include webhooks or jobs documentation.<br/>
						You can look into the repository at [https://github.com/luferro/SerpineBot](https://github.com/luferro/SerpineBot)`}
					/>
				</Skeleton>
				<br />
				<Skeleton visible={loading} className={styles.skeleton}>
					<Accordion commands={commands} />
				</Skeleton>
			</main>

			<footer className={styles.footer}>
				<Text size="lg">Made by Luís Ferro</Text>
				<div>
					<a href="https://github.com/luferro" target="_blank" rel="noopener noreferrer">
						<Image src={'/svg/github.svg'} alt="Github icon" width={32} height={32} />
					</a>
					<a href="https://www.linkedin.com/in/luis-ferro/" target="_blank" rel="noopener noreferrer">
						<Image src={'/svg/linkedin.svg'} alt="LinkedIn icon" width={32} height={32} />
					</a>
				</div>
			</footer>
		</div>
	);
};

export default Home;
