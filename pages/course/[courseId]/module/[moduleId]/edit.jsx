import { useEffect, useRef, useState } from "react";
import Editor from "../../../../../components/Editor";
import fetchWithRetry from "../../../../../functions/api";
import "tui-grid/dist/tui-grid.css";
import Link from "next/link";
import { useRouter } from "next/router";

class CustomButtonRenderer {
    constructor(props) {
        this.el = document.createElement('button');
        this.el.onclick = () => {
            props.columnInfo.renderer.options.onClick(props.grid.getRow(props.rowKey));
        };
        this.render(props);
    }

    getElement() {
        return this.el;
    }

    render(props) {
        const textValue = props.columnInfo.renderer.options.getTextValue(props.value);
        this.el.innerText = textValue;
    }
}

export async function getServerSideProps(context) {
    const { courseId, moduleId } = context.query;

    const getModuleResponse = await fetchWithRetry(`/course/${courseId}/${moduleId}`);
    const getAllMissionAndArticlesResponse = await fetchWithRetry(`/course/missionAndArticles/${moduleId}`);

    if(!getModuleResponse.ok) {
        return {
            props: {
                module: null,
                articles: [],
                courseId,
                moduleId,
            }
        }
    }

    if(!getAllMissionAndArticlesResponse.ok) {
        return {
            props: {
                module: await getModuleResponse.json(),
                articles: [],
                courseId,
                moduleId,
            }
        }
    }

    return {
        props: {
            module: await getModuleResponse.json(),
            articles: await getAllMissionAndArticlesResponse.json(),
            courseId,
            moduleId,
        }
    }
}

export default function EditModule({ module, articles, courseId, moduleId }) {
    const editorRef = useRef(null);
    const gridRef = useRef(null);
    const [missionAndArticles, setMissionAndArticles] = useState(articles);
    const router = useRouter();

    const handleFetchMissionAndArticle = async () => {
        const getAllMissionAndArticlesResponse = await fetchWithRetry(`/course/missionAndArticles/${moduleId}`);

        setMissionAndArticles(await getAllMissionAndArticlesResponse.json());
    }

    const handleEditReference = async ({ id }) => {
        const getModuleResponse = await fetchWithRetry(`/course/${courseId}/${moduleId}/${id}`, {
            method: "PUT",
        });

        if(getModuleResponse.ok) {
            handleFetchMissionAndArticle();
        }
    }

    const getTextValue = value => {
        return value ? "적용 해제 하기" : "적용 하기";
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);

        const { editorInstance } = editorRef.current;

        formData.append("content", editorInstance.getMarkdown());

        const editModuleResponse = await fetchWithRetry(`/course/${courseId}/module/${moduleId}`, {
            method: "PUT",
            body: formData,
        });

        if(editModuleResponse.ok) {
            router.push(`/course/${courseId}/module/${moduleId}`);
        }
    }

    useEffect(() => {
        const getGrid = async () => {
            const Grid = (await import("tui-grid")).default;

            if (!gridRef.current.instance) {
                const grid = new Grid({
                    el: gridRef.current,
                    bodyHeight: 300,
                    columns: [
                        {
                            header: "제목",
                            name: "title",
                        },
                        {
                            header: "카테코리",
                            name: "category"
                        },
                        {
                            header: " ",
                            name: "checked",
                            width: 120,
                            align: "center",
                            renderer: {
                                type: CustomButtonRenderer,
                                options: {
                                    onClick: handleEditReference,
                                    getTextValue
                                }
                            }
                        }
                    ],
                    data: missionAndArticles
                });

                gridRef.current.instance = grid;
            } else {
                gridRef.current.instance.resetData(missionAndArticles);
            }

            Grid.applyTheme("striped");
        }

        getGrid();
    }, [missionAndArticles]);

    return <form onSubmit={handleSubmit}>
        <Link href={`/course/${courseId}/module/${moduleId}`}>뒤로가기</Link>
        <input type="submit" value="저장하기" />
        <hr />
        <input type="text" name="title" id="title" defaultValue={module.title} />
        <input type="text" name="category" id="category" defaultValue={module.category} placeholder="카테고리를 입력해주세요" />
        <hr />
        <h1>모듈 참고 링크</h1>
        <button onClick={handleFetchMissionAndArticle}>미션, 아티클 불러오기</button>
        <div ref={gridRef} className="ref-grid"></div>
        <hr />
        <Editor editorRef={editorRef} content={module.content} />
    </form>;
}