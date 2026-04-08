import type {
  ChildProfile,
  EducationParameters,
  TimelineYear,
  EducationYearResult,
  YearlyEducationResult,
} from "@/types"

function computeSchoolCost(
  childAge: number,
  yearIndex: number,
  child: ChildProfile,
  params: EducationParameters
): number {
  const { schoolStartAge } = child
  const { currentAnnualFee, inflationPercent, durationYears } = params.school

  if (childAge < schoolStartAge || childAge >= schoolStartAge + durationYears) {
    return 0
  }

  return currentAnnualFee * Math.pow(1 + inflationPercent / 100, yearIndex)
}

function computeStageCost(
  childAge: number,
  yearIndex: number,
  stageStartAge: number,
  stage: { currentTotalCost: number; inflationPercent: number; durationYears: number }
): number {
  if (childAge < stageStartAge || childAge >= stageStartAge + stage.durationYears) {
    return 0
  }

  const annualPortion = stage.currentTotalCost / stage.durationYears
  return annualPortion * Math.pow(1 + stage.inflationPercent / 100, yearIndex)
}

export function computeEducationForYear(
  timeline: TimelineYear,
  children: ChildProfile[],
  params: EducationParameters
): YearlyEducationResult {
  const perChild: EducationYearResult[] = children.map((child, childIndex) => {
    const childAge = timeline.childAges[childIndex]
    const yearIndex = timeline.yearIndex

    const schoolCost = computeSchoolCost(childAge, yearIndex, child, params)
    const graduationCost = computeStageCost(
      childAge,
      yearIndex,
      child.graduationStartAge,
      params.graduation
    )
    const postGraduationCost = computeStageCost(
      childAge,
      yearIndex,
      child.postGraduationStartAge,
      params.postGraduation
    )

    return {
      childIndex,
      schoolCost,
      graduationCost,
      postGraduationCost,
      totalCost: schoolCost + graduationCost + postGraduationCost,
    }
  })

  const totalEducationCost = perChild.reduce((sum, c) => sum + c.totalCost, 0)

  return { perChild, totalEducationCost }
}
