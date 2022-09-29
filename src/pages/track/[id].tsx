import type { GetServerSideProps, NextPage } from 'next';
import { useEffect, useState } from 'react';

import * as statsfm from '@statsfm/statsfm.js';

import { Image } from '@/components/Image';
import { Section } from '@/components/Section';
import { Carousel } from '@/components/Carousel';
import { TopListenerCardSkeleton } from '@/components/TopListenerCard';
import TopListenerCard from '@/components/TopListenerCard/TopListenerCard';
import { AlbumCard } from '@/components/AlbumCard';

import { useApi, useAuth } from '@/hooks';

import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';
import { RecentStreams } from '@/components/RecentStreams';
import { SectionToolbarCarouselNavigationButton } from '@/components/SectionToolbarCarouselNavigationButton';
import { Container } from '@/components/Container';
import { ArtistList } from '@/components/ArtistList';
import { Title } from '@/components/Title';
import { SectionToolbarInfoMenu } from '@/components/SectionToolbarInfoMenu';
import { supportUrls } from '@/utils/supportUrls';
import Head from 'next/head';

const AudioFeaturesRadarChart = ({
  acousticness,
  danceability,
  energy,
  instrumentalness,
  liveness,
  speechiness,
  valence,
}: Partial<statsfm.AudioFeatures>) => {
  const config = {
    data: {
      labels: [
        'Acoustic',
        'Danceable',
        'Energetic',
        'Instrumental',
        'Lively',
        'Speechful',
        'Valence',
      ],
      datasets: [
        {
          label: '',
          data: [
            acousticness,
            danceability,
            energy,
            instrumentalness,
            liveness,
            speechiness,
            valence,
          ],
          fill: true,
          backgroundColor: 'rgb(30, 215, 96, 0.2)',
          borderColor: 'rgb(30, 215, 96)',
          pointBackgroundColor: 'rgb(30, 215, 96)',
        },
      ],
    },
    options: {
      scales: {
        r: {
          grid: {
            circular: true,
            color: 'rgb(23, 26, 32)',
          },
          beginAtZero: true,
          angleLines: {
            color: 'rgb(23, 26, 32)',
          },
          pointLabels: {
            color: 'rgb(163, 163, 163)',
            font: {
              size: 12,
              weight: 'bold',
            },
          },
          ticks: {
            display: false,
            stepSize: 0.25,
          },
        },
      },
      elements: {
        line: {
          borderWidth: 3,
        },
      },
    },
  };

  ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler);

  return <Radar {...config} />;
};

interface Props {
  track: statsfm.Track;
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const api = new statsfm.Api();

  const id = ctx.params?.id?.toString();

  if (!id) {
    throw new Error('no param id recieved');
  }

  const track = await api.tracks.get(parseInt(id, 10));

  return {
    props: {
      track,
    },
  };
};

// const omitAudioFeatures = ({
//   danceability,
//   energy,
//   loudness,
//   speechiness,
//   acousticness,
//   instrumentalness,
//   liveness,
//   valence,
// }: statsfm.AudioFeatures) => ({
//   danceability,
//   energy,
//   loudness,
//   speechiness,
//   acousticness,
//   instrumentalness,
//   liveness,
//   valence,
// });

const Track: NextPage<Props> = ({ track }) => {
  const api = useApi();
  const { user } = useAuth();

  // const [stats, setStats] = useState<statsfm.StreamStats>();
  const [topListeners, setTopListeners] = useState<statsfm.TopUser[]>([]);
  const [audioFeatures, setAudioFeatures] = useState<statsfm.AudioFeatures>();
  // const audioFeaturesOnly = omitAudioFeatures(audioFeatures);

  const [recentStreams, setRecentStreams] = useState<statsfm.Stream[] | null>(
    null
  );

  useEffect(() => {
    (async () => {
      // const stats = await api.users.trackStats('me', track.id);

      setTopListeners(
        await api.http
          .get<statsfm.TopUser[]>(`/tracks/${track.id}/top/listeners`)
          .then((res) => res.data.items)
      );
      // TODO: fix
      setAudioFeatures(
        await api.tracks.audioFeature(track.externalIds.spotify![0] ?? '')
      );
    })();
  }, [track]);

  useEffect(() => {
    if (user) {
      api.users
        .trackStreams(user?.customId, track.id)
        .then((res) => setRecentStreams(res));
    }
  }, [track, user]);

  return (
    <>
      <Title>{track.name}</Title>
      <Head>
        <meta property="og:image" content={track.albums[0]?.image} />
        <meta property="og:image:alt" content={`${track.name}'s album cover`} />
        <meta property="og:image:width" content="240" />
        <meta property="og:image:height" content="240" />
        <meta
          property="og:title"
          content={`${track.name} (${track.albums[0]?.name}) | Stats.fm`}
        />
        <meta
          property="og:description"
          content={`View ${track.name} on stats.fm`}
        />
        <meta property="twitter:card" content="summary" />
      </Head>

      <div className="bg-foreground pt-20">
        <Container>
          <section className="flex flex-col items-center gap-5 pt-24 pb-10 md:flex-row">
            {track.albums[0]?.image && (
              <Image
                src={track.albums[0].image}
                alt={track.name}
                width={192}
                height={192}
              />
            )}

            <div className="flex flex-col justify-end">
              <span className="text-center text-lg md:text-left">
                <ArtistList artists={track.artists} />
              </span>
              <h1 className="text-center font-extrabold md:text-left">
                {track.name}
              </h1>
            </div>
          </section>
        </Container>
      </div>

      <Container className="mt-8">
        <Carousel>
          <Section
            title="Appears on"
            description={`Albums featuring ${track.name}`}
            toolbar={
              <div className="flex gap-1">
                <SectionToolbarCarouselNavigationButton />
                <SectionToolbarCarouselNavigationButton next />
              </div>
            }
          >
            <Carousel.Items>
              {track.albums.map((item, i) => (
                <Carousel.Item key={i} className="w-max">
                  <AlbumCard album={item} />
                </Carousel.Item>
              ))}
            </Carousel.Items>
          </Section>
        </Carousel>

        <Carousel>
          <Section
            title="Top listeners"
            description={`People who listen a lot to ${track.name}`}
            toolbar={
              <div className="flex gap-1">
                <SectionToolbarCarouselNavigationButton />
                <SectionToolbarCarouselNavigationButton next />
                <SectionToolbarInfoMenu
                  description="Learn more about what top listeners are and how they're calculated"
                  link={supportUrls.artist.top_listeners}
                />
              </div>
            }
          >
            <Carousel.Items>
              {topListeners.length > 0
                ? topListeners.map((item, i) => (
                    <Carousel.Item key={i}>
                      <TopListenerCard {...item} />
                    </Carousel.Item>
                  ))
                : Array(10)
                    .fill(null)
                    .map((_n, i) => (
                      <Carousel.Item key={i}>
                        <TopListenerCardSkeleton />
                      </Carousel.Item>
                    ))}
            </Carousel.Items>
          </Section>
        </Carousel>

        <Section title="Audio features" className="grid grid-cols-2">
          <div>
            {/* <ul className="grid w-full grid-cols-2 items-stretch gap-4">
            {audioFeaturesOnly &&
              Object.entries(audioFeaturesOnly).map((feature, i) => (
                <li key={i} className="flex flex-col">
                  <label>{feature[0]}</label>
                  <div className="h-2 appearance-none rounded-full bg-foreground">
                    <span
                      className="h-full bg-primary"
                      style={{ width: `${feature[1] * 100}%` }}
                    ></span>
                  </div>
                </li>
              ))}
          </ul> */}
          </div>
          <div>
            <AudioFeaturesRadarChart {...audioFeatures} />
          </div>
        </Section>
        <RecentStreams
          title="Recent streams"
          description="Your recently played tracks"
          streams={recentStreams || []}
          track={track}
        />
      </Container>
    </>
  );
};

export default Track;
