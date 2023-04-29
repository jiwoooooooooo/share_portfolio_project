import is from "@sindresorhus/is";
import { Router } from "express";
import { login_required } from "../middlewares/login_required";
import { educationService } from "../services/educationService"; //확인필요
const educationRouter = Router();

// 학력 정보 추가 ("/educations" 확인필요)
educationRouter.post("/educations", async (req, res, next) => {
  // @sindresorhus/is 패키지의 is.emptyObject 함수를 사용해 HTTP 요청의 body가 비어있는지 검사함(비었으면 에러 발생)
  try {
    if (is.emptyObject(req.body)) {
      throw new Error(
        "headers의 Content-Type을 application/json으로 설정해주세요"
      );
    }

    // req (request) 에서 데이터 가져오기
    const { user_id, school, major, degree } = req.body;

    // // 유저의 id 가져오기: login_required 미들웨어에서 설정한 currentUserId 속성을 사용해 현재 로그인한 사용자의 ID 값을 가져옴
    // const user_id = req.currentUserId;

    // 위 데이터를 유저 db에 추가하기: educationService의 addEducation 함수를 호출해 해당 요청 사용자의 학력 정보를 추가함
    const newEducation = await educationService.addEducation({
      user_id,
      school,
      major,
      degree,
    });

    // // educationService.addEducation 메소드 호출하고 반환된 결과의 에러가 존재하면 에러 객체를 던짐
    // if (newEducation.errorMessage) {
    //   throw new Error(newEducation.errorMessage);
    // }
    // 위코드가 educationService.addEducation에서 이미 예외처리하고 있으므로 중복된 코드라고 함...

    // 성공적인 HTTP 응답을 생성. status(201)로 201 Created 상태코드를, json()으로 newEducation 객체를 JSON 형태로 반환
    // 에러 발생시 next함수로 다음 미들웨어에 에러 객체를 던짐
    res.status(201).json(newEducation);
  } catch (error) {
    next(error);
  }
});

/**
 * 특정 유저의 모든 학력 조회
 */
educationRouter.get("/educations/:user_id", async (req, res, next) => {
  try {
    // 요청으로부터 학력id값 가져옴 (URL에서 id값 추출)
    const { user_id } = req.params;
    // educationService.getEducation 메서드로 학력 ID에 대한 정보를 가져옴
    const educations = await educationService.getEducations({ user_id });

    // 에러메시지 존재시 에러 던짐
    if (educations.errorMessage) {
      throw new Error(educations.errorMessage);
    }
    // 성공적으로 학력 정보 가져오면 HTTP응답코드(200)와 함께 응답, 에러 발생시 next로 미들웨어 함수로 에러 던짐
    res.status(200).json(educations);
  } catch (error) {
    next(error);
  }
});

// 학력 정보 수정
educationRouter.put(
  "/educations/:id",
  login_required,
  async (req, res, next) => {
    try {
      const education_id = req.params.id;
      const { school, major, degree } = req.body;
      const user_id = req.currentUserId;

      // 추출한 필드값을 setEducation 메소드의 인자로 전달하여 해당 학력 정보 업데이트
      const updatedEducation = await educationService.setEducation({
        education_id,
        user_id,
        school,
        major,
        degree,
      });

      // 에러메시지 존재시 에러 던짐
      if (updatedEducation.errorMessage) {
        throw new Error(updatedEducation.errorMessage);
      }

      // 성공하면 HTTP응답코드(200)와 함께 응답, 에러 발생시 next로 미들웨어 함수로 에러 던짐
      res.status(200).json(updatedEducation);
    } catch (error) {
      next(error);
    }
  }
);

export { educationRouter };