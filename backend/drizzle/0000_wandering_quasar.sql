CREATE TABLE "online_games" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"white_user_id" uuid,
	"black_user_id" uuid,
	"pgn" text,
	"status" varchar(20) NOT NULL,
	"result" varchar(10),
	"is_ranked" boolean DEFAULT false,
	"share_token" varchar(21),
	"white_elo_before" integer,
	"black_elo_before" integer,
	"white_elo_after" integer,
	"black_elo_after" integer,
	"created_at" timestamp DEFAULT now(),
	"ended_at" timestamp,
	CONSTRAINT "online_games_share_token_unique" UNIQUE("share_token")
);
--> statement-breakpoint
CREATE TABLE "puzzle_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"puzzle_id" uuid NOT NULL,
	"solved" boolean NOT NULL,
	"attempted_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "puzzles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lichess_id" varchar(20) NOT NULL,
	"fen" text NOT NULL,
	"moves" text NOT NULL,
	"rating" integer NOT NULL,
	"themes" text[],
	CONSTRAINT "puzzles_lichess_id_unique" UNIQUE("lichess_id")
);
--> statement-breakpoint
CREATE TABLE "saved_games" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"mode" varchar(20) NOT NULL,
	"pgn" text NOT NULL,
	"fen" text NOT NULL,
	"is_complete" boolean DEFAULT false,
	"share_token" varchar(21),
	"saved_at" timestamp DEFAULT now(),
	CONSTRAINT "saved_games_share_token_unique" UNIQUE("share_token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(32) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"board_light_color" varchar(7) DEFAULT '#F0D9B5',
	"board_dark_color" varchar(7) DEFAULT '#B58863',
	"piece_color_light" varchar(7) DEFAULT '#FFFFFF',
	"piece_color_dark" varchar(7) DEFAULT '#000000',
	"elo_rating" integer DEFAULT 1200 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "online_games" ADD CONSTRAINT "online_games_white_user_id_users_id_fk" FOREIGN KEY ("white_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "online_games" ADD CONSTRAINT "online_games_black_user_id_users_id_fk" FOREIGN KEY ("black_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "puzzle_attempts" ADD CONSTRAINT "puzzle_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "puzzle_attempts" ADD CONSTRAINT "puzzle_attempts_puzzle_id_puzzles_id_fk" FOREIGN KEY ("puzzle_id") REFERENCES "public"."puzzles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_games" ADD CONSTRAINT "saved_games_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;