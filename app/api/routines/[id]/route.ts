import { NextRequest, NextResponse } from "next/server";
import { updateDb } from "@/lib/db";
import { z } from "zod";

const UpdateRoutineSchema = z.object({
  title: z.string().optional(),
  cost: z.number().positive().optional(),
  reminderTime: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = UpdateRoutineSchema.parse(body);

    let updatedRoutine: any = null;

    await updateDb((db) => {
      const routine = db.routines.find((r) => r.id === id);
      if (!routine) return;

      if (validated.title !== undefined) routine.title = validated.title;
      if (validated.cost !== undefined) routine.cost = validated.cost;
      if (validated.reminderTime !== undefined) routine.reminderTime = validated.reminderTime;
      if (validated.isActive !== undefined) routine.isActive = validated.isActive;

      updatedRoutine = { ...routine };
    });

    if (!updatedRoutine) {
      return NextResponse.json(
        { success: false, error: "Routine not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Routine updated successfully",
      data: updatedRoutine,
    });
  } catch (error: any) {
    console.error("[API PATCH /api/routines/[id]] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update routine" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let deleted = false;

    await updateDb((db) => {
      const idx = db.routines.findIndex((r) => r.id === id);
      if (idx !== -1) {
        db.routines.splice(idx, 1);
        deleted = true;
      }
    });

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Routine not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Routine deleted successfully",
    });
  } catch (error: any) {
    console.error("[API DELETE /api/routines/[id]] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete routine" },
      { status: 500 }
    );
  }
}
