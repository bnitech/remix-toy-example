import {
  ActionIcon,
  Box,
  Button,
  Center,
  Divider,
  Menu,
  Modal,
  PasswordInput,
  Space,
  Text,
  Title,
} from "@mantine/core";
import {
  IconChevronLeft,
  IconDotsVertical,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
import PostView from "~/components/Post/Viewer";
import CommentUpload from "~/components/Post/Comment/Upload";
import List from "~/components/List";
import CommentItem from "~/components/Post/Comment/item";
import { deletePost, getPost, TPost } from "~/models/post.service";
import {
  ActionFunction,
  json,
  LoaderFunction,
  redirect,
} from "@remix-run/node";
import { useEffect, useState } from "react";
import qs from "qs";
import * as process from "process";
import { showNotification } from "@mantine/notifications";

interface ILoaderData {
  post: TPost;
}

export enum InputType {
  DELETE_POST = "0",
  EDIT_POST = "1"
}

type InputData = {
  action: InputType;
  id?: number;
  password: string;
};

interface IActionData {
  message: TMessage;
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const postId = params.postId as string;
  const getPostResponse = await getPost(parseInt(postId));
  if (getPostResponse !== null) {
    return json<ILoaderData>({ post: getPostResponse.data as TPost });
  } else {
    return redirect("/");
  }
};

export const action: ActionFunction = async ({ request, params }) => {
  const postId = params.postId as string;
  const data = qs.parse(await request.text()) as unknown as InputData;
  switch (data.action) {
    case InputType.DELETE_POST: {
      if (data.password !== process.env.ADMIN_PASSWORD) {
        return json<IActionData>({
          message: {
            title: "삭제 실패",
            message: "비밀번호가 일치하지 않습니다.",
            color: "red",
          },
        });
      }
      if (data.id) {
        const post = await deletePost(parseInt(postId));
        return redirect("/");
      }
    }
  }

  return json<IActionData>({
    message: {
      title: "처리 실패",
      message: "알 수 없는 오류가 발생했습니다.",
      color: "red",
    },
  });
};

export default function PostId() {
  const loaderData = useLoaderData<ILoaderData>();
  const actionData = useActionData<IActionData>();
  const [post, setPost] = useState<TPost>(loaderData.post);
  const [deleteModalOpened, setDeleteModalOpened] = useState<boolean>(false);
  const [message, setMessage] = useState<IActionData>();

  useEffect(() => {
    setPost(loaderData.post);
  }, [loaderData.post]);

  useEffect(() => {
    if (actionData) {
      setMessage(actionData);
    }
  }, [actionData]);

  useEffect(() => {
    if (message) {
      showNotification({
        title: message.message.title,
        message: message.message.message,
        color: message.message.color,
      });
    }
  }, [message]);

  return (
    <Box sx={{ padding: "45px" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Link to={"/"}>
            <ActionIcon>
              <IconChevronLeft size={24} />
            </ActionIcon>
          </Link>
          <Space w="xs" />
          <Title>{post?.title ?? "(제목 없음)"}</Title>
        </Box>
        <Menu shadow="md" width={200} position={"left-start"}>
          <Menu.Target>
            <ActionIcon>
              <IconDotsVertical />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Link to={`/posts/${post.id}/update`}>
              <Menu.Item icon={<IconPencil size={14} />}>글 수정하기</Menu.Item>
            </Link>
            <Menu.Item
              color="red"
              icon={<IconTrash size={14} />}
              onClick={() => setDeleteModalOpened(true)}
            >
              글 삭제하기
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
        <Modal
          opened={deleteModalOpened}
          onClose={() => setDeleteModalOpened(false)}
          title={"글 삭제"}
        >
          <Text align={"center"}>
            글을 삭제하기 위해서는 비밀번호를 입력해주세요
          </Text>
          <Space h="lg" />
          <Form method={"post"}>
            <input hidden={true} name={"id"} value={post.id} />
            <Center>
              <PasswordInput
                sx={{ minWidth: "200px" }}
                name={"password"}
                placeholder={"관리자 비밀번호"}
              />
            </Center>
            <Space h={"lg"} />
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Button
                variant={"default"}
                onClick={() => setDeleteModalOpened(false)}
              >
                취소
              </Button>
              <Space w={"md"} />
              <Button
                color={"red"}
                type={"submit"}
                name={"action"}
                value={InputType.DELETE_POST}
              >
                삭제
              </Button>
            </Box>
          </Form>
        </Modal>
      </Box>
      <Divider mt={20} mb={15} />
      <PostView content={post?.content ?? "(글 내용 없음)"} />
      <Divider mt={20} mb={20} />
      <Box>
        <Text>댓글 2개</Text>
        <Space h="lg" />
        <CommentUpload />
        <List>
          <CommentItem
            comment={{
              writer: "작성자",
              created_at: "2023-07-08",
              content: "댓글 내용 1",
            }}
          />
          <CommentItem
            comment={{
              writer: "작성자",
              created_at: "2023-07-08",
              content: "댓글 내용 2",
            }}
          />
          <CommentItem
            comment={{
              writer: "작성자",
              created_at: "2023-07-08",
              content: "댓글 내용 3",
            }}
          />
          <CommentItem
            comment={{
              writer: "작성자",
              created_at: "2023-07-08",
              content: "댓글 내용 4",
            }}
          />
        </List>
      </Box>
    </Box>
  );
}
