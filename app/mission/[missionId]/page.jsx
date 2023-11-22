import Link from "next/link";
import Viewer from "../../../components/Viewer";
import fetchWithRetry from "../../../functions/api";
import missionstyle from "./mission.module.css";
import ContentNavigation from "../../../components/ContentNavigation";

async function getMission(missionId) {
    const getMissionResponse = await fetchWithRetry(`/mission/${missionId}`);

    if (!getMissionResponse.ok) return {
        title: "",
        content: ""
    }

    return await getMissionResponse.json();
}

export default async function MissionPage({ params }) {
    const { missionId } = params;
    const mission = await getMission(missionId);
    const links = [{
        href: `/mission/${missionId}/submit/new`,
        text: "미션제출하러가기"
    }, {
        href: `/mission/${missionId}/submit`,
        text: "미션제출보기"
    }];

    return <div className={missionstyle.wrapper}>
        <ContentNavigation links={links} />
        <h1>{mission.title}</h1>
        <div className={missionstyle.content}>
            <Viewer content={mission.content} />
        </div>
    </div>
}